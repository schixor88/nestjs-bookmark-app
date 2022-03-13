import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      
      delete user.hash;

      return user;
    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError){
            if(error.code === 'P2002'){ // prisma code for unique id duplication
                throw new ForbiddenException('Credentials Taken')
            }
        }
        throw error;
    }
  }

  async signin(dto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
        where:{
            email: dto.email,
        },
    });
     // if user does not exist then throw exception
    if(!user){
        throw new ForbiddenException(
            'Credentials Incorrect. User Not Found.'
        );
    }
   
    //compare passwords
    const pwMatch = await argon.verify(user.hash, dto.password)
    // if password wrong give exception
    if(!pwMatch){
        throw new ForbiddenException(
            'Invalid Credentails!'
        );
    }
    delete user.hash;


    //send back user
    return user;
  }
}
