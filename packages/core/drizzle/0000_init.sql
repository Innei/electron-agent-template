CREATE TABLE `ai_role_settings` (
	`role` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`provider` text,
	`model_id` text,
	`thinking_level` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`ts` text NOT NULL,
	`day` text NOT NULL,
	`layer` text NOT NULL,
	`scope` text NOT NULL,
	`model` text NOT NULL,
	`origin` text,
	`calls` integer NOT NULL,
	`total_tokens` integer NOT NULL,
	`input` integer NOT NULL,
	`output` integer NOT NULL,
	`cache_read` integer NOT NULL,
	`cache_write` integer NOT NULL,
	`cost_total` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_usage_day` ON `ai_usage` (`day`);--> statement-breakpoint
CREATE TABLE `app_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assistant_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assistant_sessions_updated` ON `assistant_sessions` (`updated_at`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`ts` text NOT NULL,
	`role` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_messages_session` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_updated` ON `notes` (`updated_at`);--> statement-breakpoint
CREATE TABLE `provider_credentials` (
	`provider` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`updated_at` text NOT NULL
);
