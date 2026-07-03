import { Controller, Get, Res } from '@nestjs/common';
import * as path from 'path';

@Controller('admin')
export class AdminController {
  @Get()
  getAdmin(@Res() res: any) {
    res.sendFile(path.join(__dirname, '../../public/admin.html'));
  }
}
