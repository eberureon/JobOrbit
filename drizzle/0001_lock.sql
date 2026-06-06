CREATE TABLE `lock` (
	`id` integer PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`hash` text,
	`session_ttl_hours` integer
);
