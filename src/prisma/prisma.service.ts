import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';


//https://youtu.be/GHTA143_b-s?t=5713

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config:ConfigService){
        super({
          datasources:{
            db:{
              url:config.get('DATABASE_URL'),
            }
          }
        })
        // console.log({config})
      }
}
