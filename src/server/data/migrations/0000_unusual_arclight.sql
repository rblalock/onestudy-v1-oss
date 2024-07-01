CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS "helloworld" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"digits" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"status" text,
	"summary" text,
	"summary_title" text,
	"sentiment" text,
	"raw_messages" jsonb,
	"user_meta_data" jsonb,
	"cached_study" jsonb,
	"cached_interview_id" text,
	"study_id" text,
	"organization_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"meta" jsonb,
	"domain" text,
	"webhookAppId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_group" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"organization_id" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_member" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"organization_id" text,
	"user_id" text,
	"role" text NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"status" text,
	"meta" jsonb,
	"summary" text,
	"interviewer_style" text,
	"interviewer_style_custom_message" text,
	"organization_id" text,
	"org_group_id" text,
	"user_id" text,
	"user_meta_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_emails" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"organization_id" text,
	"study_id" text,
	"meta" jsonb,
	CONSTRAINT "study_emails_study_id_unique" UNIQUE("study_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_insight" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"question" text,
	"response" jsonb,
	"referenced_documents" jsonb,
	"organization_id" text,
	"study_id" text,
	"shared" boolean,
	"processing" boolean,
	"key_quote" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"color" text,
	"tag_name" text,
	"study_id" text,
	"organization_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"auth_meta" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vector_documents" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"document_type" text,
	"document_title" text,
	"document_body" text,
	"embedding" vector(1536),
	"document_reference_id" text,
	"organization_id" text,
	"study_id" text,
	"meta" jsonb,
	CONSTRAINT "vector_documents_document_reference_id_unique" UNIQUE("document_reference_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "interview" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_id_idx" ON "interview" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "org_group" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "study" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_id_idx" ON "study" ("org_group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_id_idx" ON "study_emails" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "study_insight" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_id_idx" ON "study_insight" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "tag" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_id_idx" ON "tag" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_id_idx" ON "vector_documents" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_id_idx" ON "vector_documents" ("study_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview" ADD CONSTRAINT "interview_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "study"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview" ADD CONSTRAINT "interview_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_group" ADD CONSTRAINT "org_group_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_org_group_id_org_group_id_fk" FOREIGN KEY ("org_group_id") REFERENCES "org_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_emails" ADD CONSTRAINT "study_emails_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_emails" ADD CONSTRAINT "study_emails_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "study"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_insight" ADD CONSTRAINT "study_insight_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_insight" ADD CONSTRAINT "study_insight_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "study"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag" ADD CONSTRAINT "tag_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "study"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag" ADD CONSTRAINT "tag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vector_documents" ADD CONSTRAINT "vector_documents_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vector_documents" ADD CONSTRAINT "vector_documents_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "study"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
