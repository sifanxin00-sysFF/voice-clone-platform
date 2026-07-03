CREATE TABLE `tts_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`voice_id` integer,
	`voice_name` text,
	`output_path` text,
	`format` text DEFAULT 'mp3' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`voice_id`) REFERENCES `voices`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `voices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`fish_model_id` text NOT NULL,
	`description` text,
	`state` text DEFAULT 'created' NOT NULL,
	`sample_audio_path` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `voices_fish_model_id_unique` ON `voices` (`fish_model_id`);