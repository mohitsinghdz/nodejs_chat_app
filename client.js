const promt = require('prompt') //utility to get promts
const util = require('util')
const axios = require('axios') //promise based http client
const {ChatManager, TokenProvider} = require('@pusher/chatkit')
const {JSDOM} = require('jsdom')
require('dotenv').config()
const readline = require('readline')
const createuser  = async username => {
    try{
        await axios.post('http://localhost:3001/users',{
            username
        })
    }catch(error){
        console.error(error)
    }
    
}


const makechatcompat = () => {
    const { window } = new JSDOM();
    global.window = window;
    global.navigator = {};
  };


const main = async() =>{
    //makechatcompat()
    try{
        makechatcompat()
    promt.start()
    promt.message = ''
    const get = util.promisify(promt.get)
    const usernameSchema = [
    {
        description:'Enter your username',
        name:'username',
        required: true
    }
]
    const {username} = await get(usernameSchema)
    console.log(username)

    const chatmanager = new ChatManager ({
        instanceLocator : process.env.IL,
        userId: username,

      tokenProvider: new TokenProvider({
        url: "http://localhost:3001/authenticate"
        })
    })

    const currentUser = await chatmanager.connect()
    console.log(currentUser.username)
    const joinableRooms = await currentUser.getJoinableRooms()
    const availableRooms = [...currentUser.rooms,...joinableRooms] //use of desctructers (helps you join arrays)
    availableRooms.forEach((room,index)=>
    { console.log(`${index} -  ${room.name}`)
     
    })
const roomschema = [
    {
        description:'select a room',
        name: 'chosenRoom',
        required: true
    }
    ]
     const {chosenRoom } = await get(roomschema)
     const room = availableRooms[chosenRoom]
    
     await currentUser.subscribeToRoom({
         roomId: room.id,
         hooks: {
             onNewMessage: message => {     //messages to be executed on real time
           if(message.senderId != username)
                console.log(`${message.senderId} - ${message.text}`)
             }
         },
         messageLimit : 0 
     })


     const input = readline.createInterface({
         input: process.stdin
     })

     input.on('line',async text => {
        await currentUser.sendMessage({
            roomId:room.id,
            text

        }) 
     })
}catch(error) {
    console.log(error)
    process.exit(1);
}

}



main()