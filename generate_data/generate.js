var MongoClient = require('mongodb').MongoClient;
const { faker } = require('@faker-js/faker');
const fs = require('fs');
faker.setLocale('vi');

var url =
  'mongodb+srv://kiennt1807:y5uvUwQ8PsnulUnH@cluster0.orfpz.mongodb.net/travelsocial';
let placeUrls = JSON.parse(fs.readFileSync('./places_url.json', 'utf-8'));
let placeDetails = JSON.parse(fs.readFileSync('./data.json', 'utf-8')).slice(
  0,
  40,
);
let userAvatarUrls = JSON.parse(
  fs.readFileSync('./user_avatar_urls.json', 'utf-8'),
);
let userAddressDetails = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
const avatarImages = userAvatarUrls.map((i) => i.url);
const a_image = placeUrls.map((i) => i.url);
const a_video = [
  'https://media.istockphoto.com/videos/picture-post-card-perfect-landscape-scenery-of-llyn-padarn-lake-with-video-id1324947942',
  'https://media.istockphoto.com/videos/aerial-drone-video-over-river-tay-scotland-video-id1273093103',
  'https://media.istockphoto.com/videos/aerial-view-of-mountains-covered-with-forest-trees-with-blue-sky-video-id1327884148',
  'https://media.istockphoto.com/videos/aerial-view-on-tea-plantation-in-sri-lanka-video-id642460768',
  'https://media.istockphoto.com/videos/summer-meadow-with-long-grass-gently-blowing-in-the-wind-video-id1225633028',
  'https://media.istockphoto.com/videos/the-sun-casts-its-beautiful-rays-into-the-fresh-green-forest-time-video-id1168431157',
  'https://media.istockphoto.com/videos/real-time-shot-of-sea-surf-aerial-top-down-view-video-id946257202',
  'https://media.istockphoto.com/videos/view-of-clouds-over-the-mountains-from-above-video-id1316701553',
  'https://assets.mixkit.co/videos/preview/mixkit-very-close-shot-of-the-leaves-of-a-tree-wet-18310-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-people-pouring-a-warm-drink-around-a-campfire-513-large.mp4',
];
let randomHashtags = [];
var a_users = [];
var a_posts = [];
let userPlaces = [];

function getRandom(array) {
  return array[getRandomInRange(array.length)];
}

function getRandomInRange(range) {
  return Math.floor(Math.random() * range);
}
function getTimePreviousTime(times, days) {
  var result = times;
  result.setDate(result.getDate() - days);
  result.setHours(result.getHours() - getRandomInRange(20));
  result.setMinutes(result.getMinutes() - getRandomInRange(40));
  return result;
}
function getTimeAfterTime(times, days) {
  var result = times;
  result.setDate(result.getDate() + days);
  result.setHours(result.getHours() + getRandomInRange(4));
  result.setMinutes(result.getMinutes() + getRandomInRange(40));
  return result;
}
function randomHashtagArray(count) {
  var a_ht = [];
  for (let i = 0; i < count; i++) {
    switch (getRandomInRange(2)) {
      case 0:
        a_ht.push('#' + faker.word.noun());
        break;
      case 1:
      default:
        a_ht.push('#' + faker.word.verb());
    }
  }
  return a_ht;
}
//main insert data
async function insertUser(a_users, number, dbo) {
  let userPromise = new Promise(async function (resolve) {
    console.log('generate users');
    for (let i = 0; i < number; i++) {
      const sexNumber = getRandomInRange(3);
      let sex;
      switch (sexNumber) {
        case 0:
          sex = 'female';
          break;
        case 1:
          sex = 'male';
          break;
        default:
          sex = null;
          break;
      }
      const name = faker.name.findName(null, null, sex);
      const nameSplit = name.split(' ');
      const noAccent = removeAccent(name);
      const avt = getRandom(avatarImages);
      const bg = getRandom(a_image);
      const date = faker.date.between(
        '1980-01-01T00:00:00.000Z',
        '2012-01-01T00:00:00.000Z',
      );
      const userAddress = getRandom(userAddressDetails);
      const userObject = {
        email: changeToGmail(
          faker.internet.email(
            removeAccent(getRandom(nameSplit)),
            removeAccent(getRandom(nameSplit)),
          ),
        ),
        password:
          '$2b$10$ENOX9H2CmatQBLTjMSiXJec.7NknF8r2kVhK4BHV9/G3cMxC2AT9.',
        displayName: name,
        displayNameNoAccent: noAccent,
        birthday: date,
        isActive: true,
        avatar: avt,
        coverPhoto: bg,
        bio: faker.lorem.sentences(),
        sex: sexNumber,
        address: {
          name: userAddress.name,
          coordinate: userAddress.coordinate,
          formattedAddress: userAddress.formattedAddress,
        },
        followers: 0,
        followings: 0,
        createdAt: date,
        updatedAt: date,
        renamableTime: new Date(),
        __v: 0,
      };
      var result = await dbo.collection('users').insertOne(userObject);
      a_users.push(result.insertedId);

      var a_media = [
        {
          type: 'image',
          des: 'Ảnh đại diện',
          url: avt,
        },
        {
          type: 'image',
          des: 'Ảnh bìa',
          url: bg,
        },
      ];
      await insertMediaFile(result.insertedId, a_media, dbo, date);
    }
    resolve('insert users done.');
  });
  console.log(await userPromise);
}
async function insertFollowing(a_users, follow_number, dbo) {
  let followPromise = new Promise(async function (resolve) {
    console.log('generate followings');
    const promises = [];
    for (let i = 0; i < a_users.length; i++) {
      var a_follow = [];
      for (let j = 0; j < follow_number; j++) {
        var follow_id = getRandom(a_users);
        while (follow_id.toString() == a_users[i].toString())
          follow_id = getRandom(a_users);
        a_follow.push(getRandom(a_users));
      }
      a_follow = [...new Set(a_follow)];
      for (let j = 0; j < a_follow.length; j++) {
        var follow_id = a_follow[j];
        if (!follow_id || !a_users[i]) continue;
        if (follow_id.toString() === a_users[i].toString()) continue;
        var followObject = {
          user: a_users[i],
          following: follow_id,
          __v: 0,
        };
        promises.push(
          dbo.collection('followings').insertOne(followObject),
          dbo
            .collection('users')
            .updateOne({ _id: a_users[i] }, { $inc: { followings: 1 } }),
          dbo
            .collection('users')
            .updateOne({ _id: follow_id }, { $inc: { followers: 1 } }),
        );
      }
    }
    await Promise.all(promises);
    resolve('insert followings done');
  });
  console.log(await followPromise);
}
async function insertHagtash(a_ht, post_date, dbo) {
  let hashtagPromise = new Promise(async function (resolve) {
    const promises = [];
    for (let h = 0; h < a_ht.length; h++) {
      var ht = a_ht[h];
      promises.push(
        await dbo.collection('hashtags').updateOne(
          {
            hashtag: ht,
          },
          {
            $inc: { popular: 1 },
            $set: { __v: 0 },
          },
          {
            upsert: true,
          },
        ),
      );
    }
    await Promise.all(promises);
    resolve('insert hashtags done.');
  });
  console.log(await hashtagPromise);
}
async function insertComment(
  a_users,
  postId,
  post_comment,
  child_comment,
  post_date,
  dbo,
) {
  let commentPromise = new Promise(async function (resolve) {
    var comment_count = getRandomInRange(post_comment + 1);
    for (var r = 0; r < comment_count; r++) {
      var child_comment_count = getRandomInRange(child_comment + 1);
      var comment_time = faker.date.between(post_date, new Date());
      var commentObject = {
        postId: postId,
        userId: getRandom(a_users),
        parentId: null,
        comment: faker.lorem.sentences(),
        replys: child_comment_count,
        createdAt: comment_time,
        updatedAt: comment_time,
        __v: 0,
      };
      var r_comment = await dbo.collection('comments').insertOne(commentObject);
      await dbo
        .collection('posts')
        .updateOne({ _id: postId }, { $inc: { comments: 1 } });

      for (var c = 0; c < child_comment_count; c++) {
        var child_time = faker.date.between(comment_time, new Date());
        var childObject = {
          postId: postId,
          userId: getRandom(a_users),
          parentId: r_comment.insertedId,
          comment: faker.lorem.sentences(),
          replys: 0,
          createdAt: child_time,
          updatedAt: child_time,
          __v: 0,
        };
        await Promise.all([
          dbo.collection('comments').insertOne(childObject),
          dbo
            .collection('posts')
            .updateOne({ _id: postId }, { $inc: { comments: 1 } }),
        ]);
      }
    }
    resolve('insert comments done');
  });
  console.log(await commentPromise);
}
async function insertLike(a_users, postId, post_like, post_date, dbo) {
  let likePromise = new Promise(async function (resolve) {
    var like_count = getRandomInRange(post_like + 1);
    const promises = [];
    for (var r = 0; r < like_count; r++) {
      var likeTime = faker.date.between(post_date, new Date());
      var likeItem = {
        post: postId,
        user: getRandom(a_users),
        createdAt: likeTime,
        updatedAt: likeTime,
        __v: 0,
      };
      promises.push(
        dbo.collection('likes').insertOne(likeItem),
        dbo.collection('posts').updateOne(
          {
            _id: postId,
          },
          {
            $inc: { likes: 1 },
          },
        ),
      );
    }
    await Promise.all(promises);
    resolve('insert like done.');
  });
  console.log(await likePromise);
}
async function insertPost(
  a_users,
  a_posts,
  num_post,
  post_image,
  post_video,
  post_hashtag,
  post_react,
  post_comment,
  child_comment,
  dbo,
  groupId = null,
) {
  let postPromise = new Promise(async function (resolve) {
    console.log('generate posts');

    for (let i = 0; i < a_users.length; i++) {
      const currentUser = a_users[i];
      for (let j = 0; j < num_post; j++) {
        var a_ht = [];
        for (let i = 0; i < post_hashtag; i++) {
          a_ht.push(getRandom(randomHashtags));
        }
        a_ht = [...new Set(a_ht)];

        let date = faker.date.between('2021-01-01T00:00:00.000Z', new Date());

        var a_post_media = [];
        var a_mediafile = [];
        const description =
          faker.lorem.paragraphs().toString() + a_ht.join(' ');
        for (let k = 0; k < getRandomInRange(post_image + 1) + 1; k++) {
          const imgUrl = getRandom(a_image);
          var post_media_obj = {
            type: 'image',
            url: imgUrl,
          };
          var mediafile_obj = {
            type: 'image',
            url: imgUrl,
            des: description,
          };
          a_post_media.push(post_media_obj);
          a_mediafile.push(mediafile_obj);
        }

        for (let k = 0; k < getRandomInRange(post_video + 1) + 1; k++) {
          const videoUrl = getRandom(a_video);
          var post_media_obj = {
            type: 'video',
            url: videoUrl,
          };
          var mediafile_obj = {
            type: 'video',
            url: videoUrl,
            des: description,
          };
          a_post_media.push(post_media_obj);
          a_mediafile.push(mediafile_obj);
        }
        const placeDetail = getRandom(placeDetails);
        var postObject;
        if (!groupId)
          postObject = {
            user: currentUser,
            hashtags: a_ht,
            description: description,
            mediaFiles: a_post_media,
            likes: 0,
            comments: 0,
            createdAt: date,
            updatedAt: date,
            place: placeDetail.placeId,
            __v: 0,
          };
        var p_result = await dbo.collection('posts').insertOne(postObject);
        a_posts.push(p_result.insertedId);
        userPlaces.push({
          place: placeDetail.placeId,
          user: currentUser,
          __v: 0,
          lastVisitedDate: date,
          lastestPost: p_result.insertedId,
        });

        await Promise.all([
          insertMediaFile(currentUser, a_mediafile, dbo, date, groupId),
          insertHagtash(a_ht, date, dbo),
          insertComment(
            a_users,
            p_result.insertedId,
            post_comment,
            child_comment,
            date,
            dbo,
          ),
          insertLike(a_users, p_result.insertedId, post_react, date, dbo),
        ]);
      }
    }
    resolve('insert posts done.');
  });
  console.log(await postPromise);
}
async function insertPlace(userPlaces, dbo) {
  let placePromise = new Promise(async function (resolve) {
    console.log('insert places');
    userPlaces.sort((a, b) => {
      if (a.lastVisitedDate > b.lastVisitedDate) return -1;
      else if (a.lastVisitedDate === b.lastVisitedDate) return 0;
      else return 1;
    });
    const filtered = userPlaces.filter((value, index, self) => {
      const firstElemIndex = self.findIndex((t) => {
        return (
          t.user.toString() === value.user.toString() && t.place === value.place
        );
      });
      return index === firstElemIndex;
    });
    const places = placeDetails.filter((i) => {
      return filtered.findIndex((t) => t.place === i.placeId) >= 0;
    });

    const placesToInsert = places.map((i) => {
      const visitors = filtered.filter((e) => e.place === i.placeId);
      return {
        _id: i.placeId,
        name: i.name,
        formattedAddress: i.formattedAddress,
        coordinate: i.coordinate,
        visits: visitors.length,
        __v: 0,
      };
    });

    await Promise.all([
      dbo.collection('userplaces').insertMany(filtered),
      dbo.collection('places').insertMany(placesToInsert),
    ]);
    resolve('insert places done');
  });
  console.log(await placePromise);
}
async function insertMediaFile(
  userId,
  a_media,
  dbo,
  date = null,
  groupId = null,
) {
  let mediaFilePromise = new Promise(async function (resolve) {
    const promises = [];
    for (var i = 0; i < a_media.length; i++) {
      var media = a_media[i];
      if (!date) date = new Date(2010, 1, 1, 4, 3, 5);
      var mediaFileObj;
      if (!groupId) {
        mediaFileObj = {
          user: userId,
          type: media.type,
          des: media.des,
          url: media.url,
          createdAt: date,
          updatedAt: date,
          __v: 0,
        };
      }
      promises.push(dbo.collection('mediafiles').insertOne(mediaFileObj));
    }
    await Promise.all(promises);
    resolve('insert mediafiles dones.');
  });
  console.log(await mediaFilePromise);
}

MongoClient.connect(url, async function (err, db) {
  if (err) throw err;
  dbo = db.db('travelsocial');
  const collections = await dbo
    .listCollections({}, { nameOnly: true })
    .toArray();
  let startPromise = new Promise(async function (resolve) {
    for (const item of collections) {
      await dbo.collection(item.name).drop();
      console.log(`${item.name} collection deleted!`);
    }
    var create_users = await dbo.createCollection('users');
    if (create_users) console.log('Collection users created!');

    var create_posts = await dbo.createCollection('posts');
    if (create_posts) console.log('Collection posts created!');

    var create_hashtags = await dbo.createCollection('hashtags');
    if (create_hashtags) console.log('Collection hashtags created!');

    var create_followings = await dbo.createCollection('followings');
    if (create_followings) console.log('Collection followings created!');

    var create_comments = await dbo.createCollection('comments');
    if (create_comments) console.log('Collection comments created!');

    var create_reactions = await dbo.createCollection('likes');
    if (create_reactions) console.log('Collection likes created!');

    var create_userplaces = await dbo.createCollection('userplaces');
    if (create_userplaces) console.log('Collection userplaces created!');

    var create_places = await dbo.createCollection('places');
    if (create_places) console.log('Collection places created!');

    resolve('reset data done');
  });
  console.log(await startPromise);

  //insert data
  var num_user = 500;
  var num_follow = 30;
  var num_post_private = 10;
  var num_post_image = 4;
  var num_post_video = 2;
  var num_post_hashtag = 5;
  var num_post_reaction = 5;
  var num_post_comment = 5;
  var num_post_child_comment = 2;
  const num_hashtag =100;
  randomHashtags = randomHashtagArray(num_hashtag);
  await insertUser(a_users, num_user, dbo);
  await insertFollowing(a_users, num_follow, dbo);
  await insertPost(
    a_users,
    a_posts,
    num_post_private,
    num_post_image,
    num_post_video,
    num_post_hashtag,
    num_post_reaction,
    num_post_comment,
    num_post_child_comment,
    dbo,
  );
  await insertPlace(userPlaces, dbo);
  db.close();

  console.log('db close');
});

function removeAccent(alias) {
  let str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  );
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  return str;
}
function changeToGmail(mail) {
  regex = /@.*/i;
  return mail.replace(regex, getRandomInRange(10000).toString() + '@gmail.com');
}
