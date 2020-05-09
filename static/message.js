
const post_msg = Handlebars.compile(document.querySelector('#postmsg').innerHTML);

document.addEventListener('DOMContentLoaded',() =>
{
	var socket = io.connect(location.protocol+'//'+document.domain+':'+location.port);

	


		
	if(!localStorage.getItem('active_channel'))
		localStorage.setItem('active_channel','General');

	if(!localStorage.getItem('username')){

		var user = prompt("Please enter your Username:");
	  	var isvalid=false;
	  	while(!isvalid){
		  	if (user != null && user!=='') {
		 	 	localStorage.setItem('username',user);
		 	 	socket.emit('new username',{'user':user});
		 	 	isvalid=true;
		 	}
	 	}


	}else{

		console.log('Again same username');
		document.getElementById("username").innerHTML =
	    	"Username:" + localStorage.getItem('username') ;
		
		
	}

	socket.emit('load channel msgs',{'user':localStorage.getItem('username'),'channel_name':localStorage.getItem('active_channel')});

	socket.on('load channels' , data =>{
		const li=document.createElement('li');
		const keys = Object.keys(data.channels);

		console.log(data.online);
		//document.getElementById("nouser").innerHTML="No of Online Users: "+ data.online_user;


		document.querySelector('#nousers').innerHTML='No Of Online Users: '+data.online;

		keys.forEach(createlist); 
		console.log(keys)
		function createlist(item) 
		{ 
			//New Code
			const link = document.createElement('a');
			link.innerHTML=item;
			link.setAttribute("href", "#");
			if (item === localStorage.getItem('active_channel')){
				link.className= "list-group-item list-group-item-action active";
				socket.emit('load channel msgs',{'user':localStorage.getItem('username'),'channel_name':localStorage.getItem('active_channel')});
			}
			else{
				link.className= "list-group-item list-group-item-action";
			}
			link.setAttribute("data-channel", item);
			link.addEventListener("click", loadchannel, false);
			document.querySelector('#channelnew').append(link);


			//New Code END
			
			// const li =document.createElement('li');
			// //li.innerHTML = `<a href="#" onclick="loadchannel" class="channel-link" data-channel=${item}>${item}</a>`;
			// li.innerHTML = item;
			// li.className='channel-link';
			// li.setAttribute("data-channel",item);
			// li.addEventListener("click", loadchannel, false);
			// document.querySelector('#channels').append(li);

		}

	});


	function loadchannel(){
		console.log("Identified click on channels")
		console.log(this.dataset.channel)
		localStorage.setItem('active_channel',this.dataset.channel);
		socket.emit('load channel msgs',{'user':localStorage.getItem('username'),'channel_name': this.dataset.channel})
		return false;
	}

	socket.on('add username', data =>{
		localStorage.setItem('username', data.user);
		
		document.getElementById("username").innerHTML =
    	"Username:" + data.user ;

	 //    const link = document.createElement('a');
		// link.innerHTML='User: '+data.user;
		// link.setAttribute("href", "#");
		// link.className= "list-group-item list-group-item-action";
		// link.setAttribute("data-user", data.user);
		// //link.addEventListener("click", loadchannel, false);
		// document.querySelector('#channelnew').append(link);
	
	});

	socket.on('error',data=>{
		alert("Error:"+data.error);
	});

	socket.on('connect',()=>{


		document.querySelector('#submit').disabled=true;

		document.querySelector('#msg_text').onkeyup =() =>{

		if(document.querySelector('#msg_text').value.length>0)
			document.querySelector('#submit').disabled=false;
		else
			document.querySelector('#submit').disabled=true;
		};

		document.querySelector('#msg_form').onsubmit = () =>{
			const msg=document.querySelector('#msg_text').value;
			const time= new Date().toLocaleString(); 
			socket.emit('send msg',{'channel':localStorage.getItem('active_channel'),'user':localStorage.getItem('username') ,'msg':msg,'time':time});

			return false;
			
		};



		document.querySelector('#submit_channel').disabled=true;
		
		document.querySelector('#channel_name').onkeyup =() =>{

		if(document.querySelector('#channel_name').value.length>0)
			document.querySelector('#submit_channel').disabled=false;
		else
			document.querySelector('#submit_channel').disabled=true;
		};

		document.querySelector('#channel_form').onsubmit = () =>{
			const channel_name=document.querySelector('#channel_name').value;
			
			socket.emit('create newchannel',{'channel_name':channel_name});

			return false;
			
		};


	});


	socket.on('loaded channel msgs',data =>{



		if(data.user===localStorage.getItem('username')){
			// document.querySelector('#msgs').innerHTML="";

			document.querySelector('.chatlogs').innerHTML="";
			
			data.channel_msgs.forEach(createlist); 
			console.log("loaded channel msgs: "+data.channel_msgs)	
		}
		

		function createlist(item) 
		{

			const msg=post_msg({'username': item.user,'time':item.time,'msgtext':item.msg})
		
			document.querySelector('.chatlogs').innerHTML+=msg;

			console.log(`Msg: ${item.msg} ${item.user} ${item.time}`);
			
			// const li =document.createElement('li');
			// li.innerHTML=`Msg: ${item.msg} ${item.user} ${item.time}`;
			// document.querySelector('#msgs').append(li);

		}		
	});


	socket.on('added newchannel',data=>{
		// const li=document.createElement('li');
		// li.innerHTML=data.channel_name;

		// li.className='channel-link';
		// li.setAttribute("data-channel",data.channel_name);
		// li.addEventListener("click", loadchannel, false);
		// document.querySelector('#channels').append(li);

		//New Code 

		
		const link = document.createElement('a');
        link.innerHTML=data.channel_name;
        link.setAttribute("href", "#");
     	link.className= "list-group-item list-group-item-action";
        link.setAttribute("data-channel", data.channel_name);
        link.addEventListener("click", loadchannel, false);
        document.querySelector('#channelnew').append(link);


        //New Code END

		document.querySelector('#channel_name').value='';
		document.querySelector('#submit_channel').disabled=true;

	
	});


	socket.on('announce msg',data => {
		
		//New COde

		const msg=post_msg({'username': data.user,'time':data.time,'msgtext':data.msg})

		//END

		// const li =document.createElement('li');
		
		// li.innerHTML=`Msg: ${data.msg} ${data.user} ${data.time}`;
		
		if(localStorage.getItem('active_channel') === data.channel){
			// document.querySelector('#msgs').append(li);
			//Newcode
			document.querySelector('.chatlogs').innerHTML+=msg;

			document.querySelector('#msg_text').value='';
			document.querySelector('#submit').disabled=true;
		}
	});
});