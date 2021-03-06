import { prisma } from '../../../generated/prisma-client';

export default {
    // Custom Resolver
    // 하나의 field만을 위한 것.
    // 다른 field들에게 영향이 가지 않는다.
    // Prisma에서 먼저 찾고, 찾을 수 없다면 내 서버에서 찾는다.
    User : {
        posts : ({ id }) => prisma.user({ id }).posts(),
        following : ({ id }) => prisma.user({ id }).following(),
        followers : ({ id }) => prisma.user({ id }).followers(),
        likes : ({ id }) => prisma.user({ id }).likes(),
        comments : ({ id }) => prisma.user({ id }).comments(),
        rooms : ({ id }) => prisma.user({ id }).rooms(),
        postsCount : ({ id }) => prisma.postsConnection({ where : { user : { id } } }).aggregate().count(),
        followingCount : ({ id }) => 
            prisma.usersConnection({ where : { followers_some : { id } } }).aggregate().count(),
        followersCount : ({ id }) => 
            prisma.usersConnection({ where : { following_none : { id } } }).aggregate().count(),
        // #3-14 Computed Fields in Prisma 참고
        fullName : parent => {
            return `${ parent.firstName } ${ parent.lastName }`;
        },
        isFollowing : async (parent, _, { request }) => {
            const { user } = request;
            const { id : parentId } = parent;

            try {
                return prisma.$exists.user({
                    AND : [
                        {
                            id : user.id
                        },
                        {
                            following_some : {
                                id : parentId
                            }
                        }
                    ]
                });
            } catch(err) {
                console.log('computed.js amIFollowing error : ', err);

                return false;
            }
        },
        // 요청하는 사람(parent)과 요청하는 사람(request)이 같으면, 내 프로필을 요청
        isSelf : (parent, _, { request }) => {
            const { user } = request;
            const { id : parentId } = parent;

            return user.id === parentId;
        }
    }
};