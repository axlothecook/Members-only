const { Router } = require('express');
const userRouter = Router();
const userController = require('../controllers/userController');

userRouter.get('/:id/new-post', userController.getNewPost);
userRouter.post('/:id/new-post', userController.postNewPost);

userRouter.get('/:id/edit-post', userController.getEditPost);
userRouter.post('/:id/edit-post', userController.postEditPost);

userRouter.get('/:id/dlt-post', userController.getDltPost);

userRouter.get('/:id/all-posts', userController.getAllPosts);

userRouter.get('/:id/membership', userController.getMembership);
userRouter.post('/:id/membership', userController.postMembership); 

userRouter.get('/:id/update', userController.getUpdate);
userRouter.post('/:id/update', userController.postUpdate);

userRouter.get('/:id/delete', userController.getDelete);

module.exports = userRouter;