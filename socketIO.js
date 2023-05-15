const { Server } = require('socket.io')

function socketConnection(server){
    console.log('socket connection calling')
    const io = new Server(server,{ 
        cors:{
          origin: 'http://localhost:3000',
          methods:["GET","POST"]
        }
      })

      
      io.on('connection',(socket)=>{

        
        console.log(`socket connection : ${socket.id}`)
       
        
        //socket for chat 

        socket.on('setup',(Id)=>{
          socket.join(Id);
          console.log('socket join : ',Id)
          socket.emit('connected')
        })

        socket.on('send_message',(data)=>{
          socket.to(data.conversationId).emit('recieve_message',data)
        })


        // socket for videocall

        socket.on('me',(conversation) => {
          socket.join(conversation);
          console.log(conversation,'conversation id joined')
        })

        socket.on('disconnect',()=>{
          socket.broadcast.emit('callended')
        })
        socket.on('callended',(id)=>{
          socket.broadcast.to(id).emit('callended',id)
          socket.leave(id);
          console.log(id,'callended')
        })

        socket.on('calluser',({ userToCall, from , signalData, name })=>{
          socket.broadcast.to(userToCall).emit('calluser',{ signal: signalData, from , name })
        })

        socket.on('answercall',(data)=>{
          console.log('answercall on')
          io.to(data.to).emit('callaccepted',data.signal)
        })



      })
}

module.exports = socketConnection;