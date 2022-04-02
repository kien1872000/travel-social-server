export const VIET_NAM_TZ = 'Asia/Ho_Chi_Minh';

export const clientUrl = 'http://localhost:3000/login/reset';

export const FOLLOWINGS_PER_PAGE = 20;
export const POSTS_PER_PAGE = 8;
export const FOLLOWERS_PER_PAGE = 15;
export const SEARCH_USER_PER_PAGE = 10;
export const MEDIA_FILES_PER_PAGE = 8;
export const VIDEOS_PERPAGE = 8;
export const TRENDING_LENGTH = 10;
export const LIKE_OF_POSTS_PERPAGE = 10;
export const FOLLOWs_SUGGESTION_LENGTH = 40;

export const NOTIFICATIONS_PERPAGE = 10;
export const CHATS_PERPAGE = 10;
export const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[._!@#$%^&*])(?=.*[a-zA-Z])[a-zA-Z0-9._!@#$%^&*]{6,20}$/;
export const EMAIL_REGEX = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/;

export const RENAMABLE_TIME = 30;
export const ACTIVATION_CODE_EXPIRE = 7;
export const RESET_PASSWORD_TOKEN_EXPIRE = 3;

export const corsOptions = {
  // origin: 'http://127.0.0.1:5500',
  origin: 'http://localhost:3000',
  credentials: true,
};
