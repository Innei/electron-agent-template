import { Body, Controller, Delete, Get, Param, Patch, Post } from "@tsuki-hono/common";
import { notesService } from "../../../../../packages/core/src/modules/notes/notes.service.js";

@Controller("notes")
export class NotesController {
  @Get("/")
  async list() {
    const data = await notesService.list();
    return { ok: true, data };
  }

  @Get("/:id")
  async get(@Param("id") id: string) {
    const data = await notesService.get({ id });
    return { ok: true, data };
  }

  @Post("/")
  async create(@Body() body: { title?: string; body?: string } | null) {
    const data = await notesService.create({ title: body?.title ?? "", body: body?.body });
    return { ok: true, data };
  }

  @Patch("/:id")
  async update(@Param("id") id: string, @Body() body: { title?: string; body?: string } | null) {
    const data = await notesService.update({ id, title: body?.title, body: body?.body });
    return { ok: true, data };
  }

  @Delete("/:id")
  async remove(@Param("id") id: string) {
    const data = await notesService.remove({ id });
    return { ok: true, data };
  }
}
