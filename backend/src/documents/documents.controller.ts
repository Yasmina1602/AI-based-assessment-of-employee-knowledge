import { 
  Controller, Get, Post, Delete, Param, ParseIntPipe, 
  UseGuards, UseInterceptors, UploadedFile, Body, Query, Res, NotFoundException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@Query('department_id') departmentId?: string) {
    const deptId = departmentId ? parseInt(departmentId, 10) : undefined;
    return this.documentsService.findAll(deptId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/content')
  getContent(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.getDocumentContent(id);
  }

  @Get(':id/file')
  async downloadFile(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    const doc = await this.documentsService.findOne(id);
    if (!fs.existsSync(doc.file_path)) {
      throw new NotFoundException('Fayl server diskida topilmadi');
    }
    return res.download(doc.file_path, doc.filename);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('department_id') departmentId: string,
    @Body('title') title?: string,
  ) {
    return this.documentsService.create(file, parseInt(departmentId, 10), title);
  }

  /**
   * "YANGILASH" tugmasi:
   * AI modeli hujjatni o'rganishi va MBBT ga saqlashi kerak
   */
  @Post(':id/sync')
  @UseGuards(RolesGuard)
  @Roles('admin')
  syncDocument(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.syncDocument(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.delete(id);
  }
}
