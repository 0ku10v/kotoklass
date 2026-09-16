CREATE TABLE `quiz_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`display_name` text NOT NULL,
	`class_name` text NOT NULL,
	`character_id` text NOT NULL,
	`score` integer NOT NULL,
	`elapsed_seconds` integer NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "quiz_results_name_check" CHECK("quiz_results"."display_name" IN ('Артём','Максим','Савелий','Кирилл')),
	CONSTRAINT "quiz_results_class_check" CHECK("quiz_results"."class_name" IN ('2 Ж','2 Д')),
	CONSTRAINT "quiz_results_character_check" CHECK("quiz_results"."character_id" IN ('inventor','researcher','dreamer')),
	CONSTRAINT "quiz_results_score_check" CHECK("quiz_results"."score" BETWEEN 0 AND 5),
	CONSTRAINT "quiz_results_elapsed_check" CHECK("quiz_results"."elapsed_seconds" BETWEEN 1 AND 300)
);
--> statement-breakpoint
CREATE INDEX `idx_quiz_results_ranking` ON `quiz_results` (`score`,`elapsed_seconds`,`completed_at`);--> statement-breakpoint
CREATE INDEX `idx_quiz_results_completed_at` ON `quiz_results` (`completed_at`);