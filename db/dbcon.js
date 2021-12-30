const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);


// bubbleName으로 저장된 그림 조회
async function getSavedData(bubbleName) {
    let result;
    try {
        await client.connect();
        const database = client.db('scribubble');
        const bubbles = database.collection('bubble');

        const query = { bubblename: bubbleName };

        const cursor = await bubbles.find(query);

        result = await cursor.hasNext() ? cursor.next() : null;
        // console.log(result);
        return result;
    } finally {
        await client.close();
    }
}

// 사용자 저장
async function insertUser(user) {
    // try {
    //     await client.connect();
    //     const database = client.db('scribubble');
    //     const users = database.collection('users');

    //     const drawings = await users.insertOne(user);

    //     console.log(drawings);
    // } finally {
    //     await client.close();
    // }
}
// insertUser().catch(console.dir);


// 그림 저장
async function insertData(data) {
    try {
        await client.connect();
        const database = client.db('scribubble');
        const bubbles = database.collection('bubble');

        await bubbles.insertOne(data);
    } finally {
        await client.close();
    }
}



// 그림 수정
async function updateData() {
    // try {
        
    // } finally {
    //     await client.close();
    // }
}


// 그림 삭제
async function deleteData() {
    // try {
       
    // } finally {
    //     await client.close();
    // }
}

module.exports = {
    insertData, 
    updateData,
    deleteData, 
    getSavedData
};