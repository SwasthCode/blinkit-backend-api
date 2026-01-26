import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class PackersService extends BaseService<PackerDocument> {
  constructor(
    @InjectModel(Packer.name) private packerModel: Model<PackerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super(packerModel);
  }

  async create(createPackerDto: any): Promise<PackerDocument> {
    const created = new this.packerModel(createPackerDto);
    const saved = await created.save();

    // If user_id is provided, ensure they have the Packer role (Role ID 3)
    if (createPackerDto.user_id) {
       await this.userModel.findByIdAndUpdate(createPackerDto.user_id, {
         $addToSet: { role: 3 }
       });
    }

    return saved;
  }
}
