import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  serial,
  uuid,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ============================================================
   USER + AUTH
   ============================================================
   Egyetlen szerepkör: admin. Egyelőre 1-2 user (Te + ügyfél).
*/
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 120 }),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

/* Auth.js JWT-vel megy → session tábla nem szükséges. */

/* ============================================================
   ÚTICÉLOK
   ============================================================ */
export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    title: varchar('title', { length: 200 }).notNull(),
    region: varchar('region', { length: 80 }).notNull(),
    excerpt: text('excerpt').notNull().default(''),
    lead: text('lead').notNull().default(''),
    coverImageUrl: text('cover_image_url'),
    coverImageAlt: varchar('cover_image_alt', { length: 200 }),
    /* body: rendezett blokkok JSON-ben:
       [
         { type:'h2',    text:'…' },
         { type:'p',     text:'…' },
         { type:'ul',    items:['…','…'] },
         { type:'image', src:'…', alt:'…' }
       ]
    */
    body: jsonb('body').$type<DestinationBodyBlock[]>().notNull().default([]),
    /* Sorrend a listán; alacsonyabb = előbb. Külön a következő-indulás-szerinti rendezéstől. */
    sortOrder: integer('sort_order').notNull().default(100),
    /* Publikálva-e (piszkozat támogatás később). */
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    publishedIdx: index('destinations_published_idx').on(t.published),
    slugIdx: uniqueIndex('destinations_slug_idx').on(t.slug),
  }),
);

export type DestinationBodyBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'image'; src: string; alt: string };

/* ============================================================
   INDULÁSOK
   ============================================================ */
export const departureStatusEnum = pgEnum('departure_status', [
  'available',
  'few',
  'full',
]);

export const departures = pgTable(
  'departures',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    /* Tárolt dátum: ISO YYYY-MM-DD (időzóna-független, mert a felhasználói naptár szerint is így gondoljuk). */
    dateISO: varchar('date_iso', { length: 10 }).notNull(),
    /* Megjelenített címke, pl. "2026. március 15." vagy "márc. 15. – márc. 22." többnapos esetén. */
    dateLabel: varchar('date_label', { length: 120 }).notNull(),
    /* Generált kompakt jelvény-érték (pl. "MÁR" + "15"); a megjelenítéshez a date_iso-ból is számolható, de lokalizációhoz tárolva. */
    monthShort: varchar('month_short', { length: 8 }).notNull(),
    day: varchar('day', { length: 4 }).notNull(),
    durationDays: integer('duration_days'),
    priceFrom: varchar('price_from', { length: 60 }), // pl. "189 000 Ft"
    status: departureStatusEnum('status').notNull().default('available'),
    note: varchar('note', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byDestIdx: index('departures_destination_idx').on(t.destinationId),
    byDateIdx: index('departures_date_idx').on(t.dateISO),
  }),
);

/* ============================================================
   MÉDIA KÖNYVTÁR
   ============================================================ */
export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(), // Vercel Blob URL
  pathname: text('pathname').notNull(), // Blob pathname-je
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 80 }).notNull(),
  width: integer('width'),
  height: integer('height'),
  sizeBytes: integer('size_bytes').notNull(),
  alt: varchar('alt', { length: 200 }).notNull().default(''),
  uploadedById: uuid('uploaded_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   FOGLALÁSOK
   ============================================================ */
export const bookingStatusEnum = pgEnum('booking_status', [
  'new',
  'contacted',
  'confirmed',
  'cancelled',
]);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 60 }).notNull(),
    message: text('message').notNull().default(''),
    /* Lehet null, ha a foglaláskor már törölték az indulást. */
    departureId: uuid('departure_id').references(() => departures.id, {
      onDelete: 'set null',
    }),
    /* Pillanatnyi snapshot az indulás állapotáról a foglalás idejében — későbbi referenciának. */
    snapshotDestinationTitle: varchar('snapshot_destination_title', { length: 200 }),
    snapshotDateLabel: varchar('snapshot_date_label', { length: 120 }),
    status: bookingStatusEnum('status').notNull().default('new'),
    adminNote: text('admin_note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index('bookings_status_idx').on(t.status),
    createdIdx: index('bookings_created_idx').on(t.createdAt),
  }),
);

/* ============================================================
   KAPCSOLATI ÜZENETEK (kapcsolat oldal form)
   ============================================================ */
export const contactMessageStatusEnum = pgEnum('contact_message_status', [
  'new',
  'replied',
  'archived',
]);

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    message: text('message').notNull(),
    status: contactMessageStatusEnum('status').notNull().default('new'),
    adminNote: text('admin_note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index('contact_messages_status_idx').on(t.status),
    createdIdx: index('contact_messages_created_idx').on(t.createdAt),
  }),
);

/* ============================================================
   OLDALI TARTALMAK / BEÁLLÍTÁSOK
   ============================================================
   Egyszerű kulcs-érték store a hero / rólam / menetrend / kapcsolati infóhoz.
   value JSONB → szöveg, kép URL, vagy strukturált adat egyben.
*/
export const siteContent = pgTable('site_content', {
  key: varchar('key', { length: 80 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedById: uuid('updated_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
});

/* ============================================================
   RELATIONS — Drizzle relációk
   ============================================================ */
export const destinationsRelations = relations(destinations, ({ many }) => ({
  departures: many(departures),
}));

export const departuresRelations = relations(departures, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [departures.destinationId],
    references: [destinations.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  departure: one(departures, {
    fields: [bookings.departureId],
    references: [departures.id],
  }),
}));

/* Type-exportok kényelemhez */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
export type Departure = typeof departures.$inferSelect;
export type NewDeparture = typeof departures.$inferInsert;
export type Media = typeof media.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
