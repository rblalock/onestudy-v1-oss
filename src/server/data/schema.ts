import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

import {
  InsightReferencedDocuments,
  RAGResponse,
  VectorDocumentType,
} from "@/core/vectorDocuments/types";

export const helloworld = pgTable("helloworld", {
  id: serial("id").primaryKey(),
  name: text("name"),
  digits: varchar("digits", { length: 256 }),
});

/**
 * -- Start core data models --
 */

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  uuid: uuid("uuid").defaultRandom(),
  authMeta: jsonb("auth_meta").$type<{ [key: string]: any }>(),
});

export const organization = pgTable("organization", {
  id: text("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  uuid: uuid("uuid").defaultRandom(),
  meta: jsonb("meta").$type<{ [key: string]: any }>(),
  domain: text("domain"),
  webhookAppId: text("webhookAppId"),
});

export const organizationMember = pgTable("organization_member", {
  id: text("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  role: text("role").notNull(),
  meta: jsonb("meta").$type<{ [key: string]: any }>(),
});

export const organizationGroup = pgTable(
  "org_group",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    uuid: uuid("uuid").defaultRandom(),
    name: text("name").notNull(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    meta: jsonb("meta").$type<{ [key: string]: any }>(),
  },
  (table) => {
    return {
      orgIdIndex: index("org_id_idx").on(table.organizationId),
    };
  }
);

/**
 * -- Start study related data models --
 */

export const study = pgTable(
  "study",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    uuid: uuid("uuid").defaultRandom(),
    name: text("name").notNull(),
    status: text("status"),
    meta: jsonb("meta").$type<{
      numberCompleted?: number;
      generalInformation?: string;
      firstQuestion?: string;
      farewellMessage?: string;
      followUpQuestionNumber?: number;
      shareTitle?: string;
      shareDescription?: string;
      primaryColor?: string;
      imageUrl?: string;
      embedUrls?: string[];
    }>(),
    summary: text("summary"),
    interviewerStyle: text("interviewer_style"),
    interviewerStyleCustomMessage: text("interviewer_style_custom_message"),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    orgGroup: text("org_group_id").references(() => organizationGroup.id),
    userId: text("user_id").references(() => user.id),
    userMetaData: jsonb("user_meta_data").$type<{ [key: string]: any }>(),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => {
    return {
      orgIdIndex: index("org_id_idx").on(table.organizationId),
      groupIdIndex: index("group_id_idx").on(table.orgGroup),
    };
  }
);

export const studyEmails = pgTable(
  "study_emails",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    studyId: text("study_id")
      .references(() => study.id, {
        onDelete: "cascade",
      })
      .unique(),
    meta: jsonb("meta").$type<{ [key: string]: any }>(),
  },
  (table) => {
    return {
      studyIdIndex: index("study_id_idx").on(table.studyId),
    };
  }
);

export const interview = pgTable(
  "interview",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    uuid: uuid("uuid").defaultRandom(),
    status: text("status"),
    summary: text("summary"),
    summaryTitle: text("summary_title"),
    sentiment: text("sentiment"),
    rawMessages: jsonb("raw_messages").$type<{ [key: string]: any }>(),
    userMetaData: jsonb("user_meta_data").$type<{ [key: string]: any }>(),
    cachedStudy: jsonb("cached_study").$type<{ [key: string]: any }>(),
    cachedInterviewId: text("cached_interview_id"),
    studyId: text("study_id").references(() => study.id, {
      onDelete: "cascade",
    }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => {
    return {
      orgIdIndex: index("org_id_idx").on(table.organizationId),
      studyIdIndex: index("study_id_idx").on(table.studyId),
    };
  }
);

export const tag = pgTable(
  "tag",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    color: text("color"),
    tagName: text("tag_name"),
    studyId: text("study_id").references(() => study.id, {
      onDelete: "set null",
    }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => {
    return {
      orgIdIndex: index("org_id_idx").on(table.organizationId),
      studyIdIndex: index("study_id_idx").on(table.studyId),
    };
  }
);

export const vectorDocument = pgTable(
  "vector_documents",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    documentType: text("document_type"),
    documentTitle: text("document_title"),
    documentBody: text("document_body"),
    embedding: vector("embedding", { dimensions: 1536 }),
    documentReferenceId: text("document_reference_id").unique(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    studyId: text("study_id").references(() => study.id, {
      onDelete: "cascade",
    }),
    meta: jsonb("meta").$type<{ [key: string]: any }>(),
  },
  (table) => {
    return {
      embeddingIndex: index("embeddingIndex").using(
        "hnsw",
        table.embedding.op("vector_cosine_ops")
      ),
      orgIdIndex: index("org_id_idx").on(table.organizationId),
      studyIdIndex: index("study_id_idx").on(table.studyId),
    };
  }
);

export const studyInsight = pgTable(
  "study_insight",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    question: text("question"),
    response: jsonb("response").$type<RAGResponse>(),
    referencedDocuments: jsonb("referenced_documents").$type<
      InsightReferencedDocuments[]
    >(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    studyId: text("study_id").references(() => study.id, {
      onDelete: "cascade",
    }),
    shared: boolean("shared"),
    processing: boolean("processing"),
    keyQuote: text("key_quote"),
  },
  (table) => {
    return {
      orgIdIndex: index("org_id_idx").on(table.organizationId),
      studyIdIndex: index("study_id_idx").on(table.studyId),
    };
  }
);
