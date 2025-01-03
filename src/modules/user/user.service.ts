import UserModel from "../../database/models/user.model"

export class UserService {
    public async findUserById(userId: string): Promise<any>{
        const user = await UserModel.findById(userId, {
            password: false
        })
        return user || null
    }
}