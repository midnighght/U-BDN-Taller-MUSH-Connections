import { Injectable } from '@nestjs/common';
import { PostDocument, Post } from './schemas/posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
type PostData = {image: String, 
        description: String, 
        taggedUsers: String, 
        hashtags: String,
        userId: String}
@Injectable()
export class PostsService {
    
constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>){}
    async createPostInDb(postData: {
        image: String; 
        description: String; 
        taggedUsers: String; 
        hashtags: String;
        userId: String
    }): Promise<Boolean> {
    try {
        const post = new this.postModel({
            mediaURL: postData.image, // Assuming the image file is stored in the `path` property
            authorID: postData.userId, 
            textBody: postData.description,
            usertags: postData.taggedUsers,
            hashtags: postData.hashtags
        }
        );
        await post.save();
        return true;
    } catch (error) {
        console.error('Error saving post:', error);
        return false;
    }
}
    async obtainUserPosts(userId: String){
        const query = await this.postModel.find({ authorID: userId }).lean().exec();
        console.log(query);
        return JSON.stringify(query);
    }
}
