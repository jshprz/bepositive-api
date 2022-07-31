import express from 'express';
import UserController from "../app/controllers/UserController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import {
    followUserApiValidation,
    profileUpdateApiValidation,
    updatePrivacyApiValidation,
    getFollowersApiValidation,
    getFollowingsApiValidation,
    verifyPhoneNumberValidation
} from '../middleware/UserApiValidationMiddleware';

const router = express.Router();
const userController = new UserController();

router.get('/profile/:userId?', authMiddleWare, (req: any, res: any) => userController.getUserProfile(req, res));
router.post('/profile/avatar/upload', authMiddleWare, (req: any, res: any) => userController.uploadProfileAvatar(req, res));
router.post('/follow/:followeeCognitoSub', [authMiddleWare, ...followUserApiValidation], (req: any, res: any) => userController.followUser(req, res));
router.patch('/unfollow/:followeeCognitoSub', [authMiddleWare, ...followUserApiValidation], (req: any, res: any) => userController.unfollowUser(req, res));
router.patch('/profile/update', [authMiddleWare, ...profileUpdateApiValidation], (req: any, res: any) => userController.updateProfile(req, res));
router.patch('/privacy-update/', [authMiddleWare, ...updatePrivacyApiValidation], (req: any, res: any) => userController.updatePrivacy(req, res));
router.get('/getFollowers/:userId?', [authMiddleWare, ...getFollowersApiValidation], (req: any, res: any) => userController.getUserFollowersProfiles(req, res));
router.get('/getFollowings/:userId?', [authMiddleWare, ...getFollowingsApiValidation], (req: any, res: any) => userController.getUserFollowingsProfiles(req, res));
router.post('/profile/sendPhoneNumberVerification', authMiddleWare, (req: any, res: any) => userController.sendPhoneNumberVerification(req, res));
router.post('/profile/verifyPhoneNumber', [authMiddleWare, ...verifyPhoneNumberValidation], (req: any, res: any) => userController.verifyPhoneNumber(req, res));
router.get('/getAccountVerificationStatus', [authMiddleWare], (req: any, res: any) => userController.getAccountVerificationStatus(req, res));

export default router;