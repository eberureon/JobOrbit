CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Applied' NOT NULL,
	`applied_date` text NOT NULL,
	`salary` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`job_url` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resume` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text DEFAULT '' NOT NULL,
	`headline` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`education` text DEFAULT '' NOT NULL,
	`links` text DEFAULT '[]' NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`old_status` text,
	`new_status` text NOT NULL,
	`changed_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
