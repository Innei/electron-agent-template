import { Module } from "@tsuki-hono/common";
import { NotesController } from "./notes.controller.js";

@Module({
  controllers: [NotesController],
})
export class NotesModule {}
