const { Router } = require('express');
// import { Router } from 'express';
const commentRouter = Router({mergeParams: true});
const { Blog, User, Comment } = require('../models');
// const { User } = require('../models/User');
// const {Comment} = require('../models/Comment');
const { isValidObjectId, startSession } = require('mongoose');

commentRouter.post('/', async (req, res) => {
    const session = await startSession();
    let comment;
    try{
        // await session.withTransaction(async()=> {
            const {blogId} = req.params;
            const { content, userId } = req.body;
            if(!isValidObjectId(blogId)) 
                return res.status(400).send({ err: "blogId is invalid"})
            if(!isValidObjectId(userId)) 
                return res.status(400).send({ err: "userId is invalid"})
            if(typeof content !== 'string') 
                return res.status(400).send({err: "content is required"})
            
            const [blog, user] = await Promise.all([
                Blog.findById(blogId, {}, {  }),
                User.findById(userId, {}, {  }),
            ])
    
            // const blog = await Blog.findByIdAndUpdate(blogId);
            // const user = await User.findByIdAndUpdate(userId);
            if(!blog || !user) 
                return res.status(400).send({err:"Blog or user does not exist"});
            if(!blog.isLive) 
                return res.status(400).send({err: "blog is not available"});
            comment = new Comment({ 
                content, 
                user, 
                userFullName: `${user.name.first} ${user.name.last}`,
                //blog를 넣어주게되면 재참조를 계속하게되서 무한 loop이 돌아가서 
                //오류가 생기게됨. (섹션9: 4강)
                blog: blogId,
            });
            //세션 중단을 해야되는 경우 *아래 코드를 사용하면 트랜섹션 안에서 발생한
            //모든 것은 다 적용되지 않음
            // await session.abortTransaction();

            // await Promise.all([
            //     comment.save(),
            //     Blog.updateOne({ _id: blogId }, { $push: {comments: comment } }),
            // ]);
            // blog.commentsCount++;
            // blog.comments.push(comment);
            // if(blog.commentsCount > 3) blog.comments.shift();
    
            // await Promise.all([
            //     comment.save({  }),
            //     //세션이 내장되어 있기 때문에 블로그에는 session을 추가하지 않아도 된다.
            //     blog.save(),
            //     // Blog.updateOne({_id: blogId}, { $inc: { commentsCount: 1 } }),
            // ])
        // });

        await Promise.all([ 
            comment.save(), 
            Blog.updateOne(
                { _id: blogId}, 
                { 
                    $inc: { commentsCount: 1 },
                    //동일한 필드를 다른 오퍼레이터로 수정하는 것은 안됨.
                    //설령 된다고 하더라도 3개가 넘어가는 순간 빼주는거라 pop을 사용할 수 없음.
                    // $pop: { comments: -1 },
                    // $push: { comments: comment },
                    $push: { comments: { $each: {comment}, $slice: -3}}
                }
            )
        ]);

        return res.send({comment});
    } catch(err) {
        console.log(err);
        return res.status(400).send({ err: err.message })
    } finally {
        // await session.endSession();
    }
    // return res.send(req.params)
});

commentRouter.get('/', async (req, res) => {
    let { page = 0 } = req.query;
    page = parseInt(page);

    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) 
        return res.status(400).send({ err: "blogId is invalid"});
    // post가 아닌 단순 조회는 있는지 없는지 여부를 계속 확인할 필요는 없다.
    const comments = await Comment.find({ blog: blogId })
        .sort({ createdAt: -1 })
        .skip( page * 3 )
        .limit(3);
    return res.send({comments})
})

commentRouter.patch('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if(typeof content !== 'string') 
        return res.status(400).send({ err: "content is required"});

    const [comment] = await Promise.all([
        Comment.findOneAndUpdate(
            { _id: commentId }, 
            { content }, 
            { new: true}
        ),
        Blog.updateOne(
            { 'comments._id': commentId }, 
            { "comments.$.content": content }
        )
    ]) 
    
    

    return res.send({ comment });
})

commentRouter.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId });
    await Blog.updateOne({ "comments._id": commentId }, { $pull: { comments: { _id: commentId }}})

    return res.send({ comment });
})

module.exports = {commentRouter};