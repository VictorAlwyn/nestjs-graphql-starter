ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_better_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."better_auth_users"("id") ON DELETE set null ON UPDATE no action;