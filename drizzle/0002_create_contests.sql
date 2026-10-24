CREATE TABLE "contest_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contest_id" uuid NOT NULL,
	"handle" text NOT NULL,
	"rank" integer NOT NULL,
	"points" double precision DEFAULT 0 NOT NULL,
	"penalty" integer DEFAULT 0 NOT NULL,
	"solved" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contest_results" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"batch_id" uuid,
	"held_on" date NOT NULL,
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contests_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "contests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contest_results" ADD CONSTRAINT "contest_results_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests" ADD CONSTRAINT "contests_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contest_results_contest_handle_idx" ON "contest_results" USING btree ("contest_id",lower("handle"));--> statement-breakpoint
CREATE INDEX "contest_results_handle_idx" ON "contest_results" USING btree (lower("handle"));