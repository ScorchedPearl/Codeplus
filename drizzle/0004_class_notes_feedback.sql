CREATE TABLE "class_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"session_day" date NOT NULL,
	"rating" integer NOT NULL,
	"pace" text,
	"liked" text,
	"improve" text,
	"name" text,
	"rate_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_feedback_rating_range" CHECK ("class_feedback"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "class_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "slides" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "filename" text;--> statement-breakpoint
ALTER TABLE "class_feedback" ADD CONSTRAINT "class_feedback_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_feedback_session_idx" ON "class_feedback" USING btree ("class_id","session_day");--> statement-breakpoint
CREATE INDEX "class_feedback_rate_idx" ON "class_feedback" USING btree ("rate_key");