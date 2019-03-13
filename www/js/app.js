// Ionic Starter App
 
//var server="192.168.2.21:8099";
var server="detweiler.dyndns.org:9999";
var serveraddress="";



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var app = angular.module('starter', ['ionic','ksSwiper']);
 
app.factory('ionicReady', function($ionicPlatform) {
  var readyPromise;

  return function () {
    if (!readyPromise) {
      readyPromise = $ionicPlatform.ready();
    }
    return readyPromise;
  };
});
 
app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
     /*   if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        } */
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

    });
}); 
 
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};


Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i]._id === obj) {
            return i;
        }
    }
    return -1;
} 

app.directive('doubleClick', ['$window','$timeout', function($window,$timeout) {

  var CLICK_DELAY = 250;
      var clickCount = -1;
      var clickTimeout=null;
      
  var $ = angular.element;
  
  return {
    priority: -1, // run before event directives
    restrict: 'A',
    link: function(scope, element, attrs) {
   		      
     // console.log("in directive binding to click");
      
      element.bind('click', function(e) {
      	console.log("click event delayed="+element.attr("_delayedSingleClick"));
        if (element.attr("_delayedSingleClick")=='true') 
        {
          console.log("delayed single click");
          element.attr("_delayedSingleClick",'false')
          //clickCount = -1;
        	  return;
        }
        
        if (++clickCount >0) 
        {
		      console.log("in directive firing doubleclick");
		      clickCount=-1;
		      doubleClick(e);
        }
        else 
        {
		      console.log("in directive setup delayed single");
		      delaySingleClick(e);
        }
      });

      function doubleClick(e) {
      	
        e.preventDefault();
        e.stopImmediatePropagation();
        if(clickTimeout!=null)
	        $timeout.cancel(clickTimeout);
	      clickTimeout=null;  
	      clonedEvent=null;
	     
       // console.log("in directive double "+clickCount);
        if (attrs.ngClick) 
        {        	
        	scope.$apply(function() { 
        //		console.log("in double firing singleclick");
       		clickCount = -1;
        		scope.$eval(attrs.ngClick) 
        		clickCount = -1;
        	});
        }
			         
        scope.$apply(function() { 
      //  	console.log("in directive firing doubleClick");
      			clickCount = -1;
       	  scope.$eval(attrs.doubleClick)
       	  clickCount = -1;  
       	});
      }	

      function timerClick(Event,thiselement) {
      //console.log("in directive single click after timer");

       		thiselement.triggerHandler('click');

					//console.log("in single click firing cloned singleclick="+Event+"element="+thiselement);        

      }

      function delaySingleClick(e) {      
     //   console.log("in directive delay single event="+e);
        var clonedEvent=null;       		
                	
     //   console.log("in directive delay single 2");
        e.preventDefault();
     //   console.log("in directive delay single 3");
        e.stopImmediatePropagation();
        try
        {
      //  	console.log("in directive delay single set timeout cloned event==null="+(clonedEvent==null?'true':'false'));			
         	element.attr('_delayedSingleClick', 'true');
       	 	scope.$apply();
       		 	clickTimeout = $timeout(timerClick,
        				CLICK_DELAY,
        				true,
        				clonedEvent,element
        			);    		
        }
        catch(ex)
        {
      //  	console.log("ex="+ex);
        }        
     //   console.log("in directive delay single done");
      };      
    }
  }  
}])  


app.controller('CarouselController', 
	function($scope,$http,$ionicSlideBoxDelegate,$window,$ionicModal,$timeout,$ionicScrollDelegate,$ionicLoading,ionicReady) {
	var Viewers=[];
	var Tags=[];
	var Images=[];
	var DataSources=[];
	//require('os').getNetworkInterfaces()
	
	$scope.DataSourceTypes= [];
	$scope.DataSourceTypes.push("File");
	$scope.DataSourceTypes.push("Samba");
	$scope.DataSourceTypes.push("DropBox");
	$scope.DataSourceTypes.push("GoogleDrive");
	$scope.DataSourceTypes.push("Onedrive");

	$scope.add=0;
	$scope.edit=1;
	$scope.enabled=false;
	$scope.dev_width = $window.innerWidth;
	$scope.dev_height = $window.innerHeight-55;
	$scope.selectedRow = {};  // initialize our variable to null
	$scope.selectedRow.viewer = null;  // initialize our variable to null
	$scope.selectedRow.datasource = null;  // initialize our variable to null
	$scope.selectedRow.image = null;  // initialize our variable to null
	$scope.selectedRow.tag = null;  // initialize our variable to null
	
	$scope.swiper = {};	
  $scope.viewer={};  
  $scope.datasource={};
  $scope.image={};
  $scope.tag={};
  $scope.modal={};
  $scope.saveobject={};
  $scope.viewer.buttontype=$scope.add;
  $scope.datasource.buttontype=$scope.add;
  $scope.image.buttontype=$scope.add;
  $scope.tag.buttontype=$scope.add; 
  $scope.ourserveraddress=server;
  var counter=0;

	$scope.next = function(){
    $ionicSlideBoxDelegate.next();
  }
  $scope.back = function(){
    $ionicSlideBoxDelegate.previous();
  }     
  $scope.tagfromID = function(id)
  {
    var r="";
  		for(var i=0;i<Tags.length;i++)
  		{
  			if(Tags[i]._id===id)
  			{
  				r=Tags[i].value;
  				break;
  			}
  		}
  		return r;
  }   
    $scope.datasourcefromID = function(id)
  {
    var r="";
  		for(var i=0;i<DataSources.length;i++)
  		{
  			if(DataSources[i]._id===id)
  			{
  				r=DataSources[i].Name;
  				break;
  			}
  		}
  		return r;
  }
	function sendTo(data,  port, addr) {
    chrome.sockets.udp.create(function(createInfo) {
    //	alert("in create");
      chrome.sockets.udp.bind(createInfo.socketId, '0.0.0.0', 0, function(result) {
      	//alert("in bind");
      	try 
      	{
      	  chrome.sockets.udp.setBroadcast(createInfo.socketId,true,function(){});
		      chrome.sockets.udp.send(createInfo.socketId, stringToArrayBuffer(data), addr, port, function(result) {
		      	//alert("in send");
		        if (result < 0) {
		          console.log('send fail: ' + result);
		          chrome.sockets.udp.close(createInfo.socketId);
		          alert("send failed result="+result);
		        } else {
		          console.log('sendTo: success ' + port);
		          chrome.sockets.udp.close(createInfo.socketId);
		          //alert("send succeeded");
		        }
		      });
        }
        catch(ex)
        {
        	alert("send error="+ex);
        }
      });
    });
  }
   
  function stringToArrayBuffer(string) {
    // UTF-8
    var buf = new ArrayBuffer(string.length);
    var bufView = new Uint8Array(buf)
    for (var i = 0, strLen = string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
  } 
	var findServerAddress = function(ip)
	{
		   var ReceiverPort =8100;
		   var BROADCAST_ADDR = "192.168.2.255";
       const MirrorRequest = "DISCOVER_MIRRORSERVER_REQUEST:";
       const expectedResponse = "DISCOVER_MIRRORSERVER_RESPONSE:";
      
			
			$scope.openModal('server');
      //console.log("have our ip address="+ip); 
      var amountReceived = 0;
      
      $scope.timeoutId = setTimeout(function() {
        console.warn('jquery only got: ' + amountReceived + ' of '+(expectedResponse.length+4) +' bytes');
        $scope.closeModal('server',null); 
      }, 120000); 
      
      var handleAccept = function(info1)
      {
      		if(++counter == 1)
      		{     		
      		//alert("accept");
					chrome.sockets.tcp.getInfo(info1.clientSocketId, 
						function(info2)
						{									
							//alert("saving peer="+	info2.peerAddress);			 
							serveraddress = info2.peerAddress;         	
					    chrome.sockets.tcp.setPaused(info1.clientSocketId, false);					    
						} 
					) 	    			
      		}
      }
      
      var recvListener = function(info) 
      {
        amountReceived += info.data.byteLength;
        //alert("receive socket info ="+info.socketId+" size="+info.data.byteLength+" amt rcv="+amountReceived);
        // 84320 is size of body, but will be more from headers.
        if (amountReceived >= expectedResponse.length+4) 
        {
        	try
        	{
		      	var arr = new Uint8Array(info.data);   				
		      	var textChunk = String.fromCharCode.apply(null,arr);
		      	//alert("data="+typeof textChunk);
		      	if(textChunk.length>0)
						{
							textChunk = textChunk.toString();
							//alert("data="+textChunk);
							// check if its the right respose
			        if (textChunk.substring(0,expectedResponse.length) === expectedResponse)
			        {        
			        	try
			        	{                           
					        var port_info = textChunk.substring(expectedResponse.length);			          
									serveraddress = serveraddress + ":" + port_info;	    
							    $scope.ourserveraddress=serveraddress; 				
							    //alert("server address="+	$scope.ourserveraddress);			
									$timeout.cancel($scope.timeoutId);	
									$scope.doRefresh();
									$scope.closeModal('server',null);												  		
									chrome.sockets.tcp.close(info.socketId);									    		  					  							                             
								}
								catch(ex)
								{
									alert("error="+ex);
								}
			        }
			        else
			        	alert("wrong message '"+textChunk.substring(0,expectedResponse.length)+"'='"+expectedResponse+"'");
		        }
          }
          catch(ex)
          {
          	alert("receve data error="+ex);
          }
        }
      };
      
      //alert("setup listener");
 			try 
 			{      
 				var p = {};
 				p.persistent=false;
	 			chrome.sockets.tcpServer.create(p,
	 				function(createInfo)
	 				{
		 				//alert("socket created");
		 				try
		 				{
		 					chrome.sockets.tcpServer.listen(createInfo.socketId,ip, 0,1,
		 						function(result)
		 						{  
									//alert("get socket info");
									chrome.sockets.tcpServer.getInfo(createInfo.socketId, 
										function(info)
										{
											port=info.localPort
											//alert("using port="+info.localPort);
											chrome.sockets.tcpServer.onAccept.addListener(handleAccept);		
											chrome.sockets.tcp.onReceive.addListener(recvListener)		
											for(var q=0;q<3;q++)					  		
						 						sendTo(MirrorRequest+info.localPort, ReceiverPort, BROADCAST_ADDR);						 					
										}
									)
				 				}				 			
				 			)
			 			}
			 			catch(ex)
			 			{
			 				alert("listen failed="+ex);
			 			}
		 			}
	 			)  
	 			//alert("after create");  
 			}
 			catch(ex)
 			{
 				alert("sockets failure="+ex);
 			}	              			
	}
  var fixupPath = function(newpart)
  {
		  var path=''
			// is a file entry
			var path=$scope.parentpath
		  if (newpart == "..")
          // remove the leaf most folder name
          path = path.substring(0, path.lastIndexOf("/"));
      else
          // go forward 
          path += "/" + newpart;
      if(path.startsWith("/*/"))
      	path=path.substring(2);
      $scope.parentpath=path.length>0?path:"";
    return path
  }
  
  $scope.typeChange = function(datasource)
  {
  		datasource.Root="/*";
  }
  $scope.sourceChange = function(image)
  {
  		image.PathFromSource="/*";
  }
  $scope.isSelected= function(Files,index)
  {
  	return Files[index].selected==true;
  }
	$scope.doubleClick=function(object, opendialog)
  {
			console.log("in doubleclick");

			var source='';
			var urlstring='';
			var path='';
			var foldersOnly=false;

			if(object.hasOwnProperty('PathFromSource'))
			{
				// is an image entry
			  $scope.parentpath=object.PathFromSource;	
               $http://scope.parentobject=object;
				console.log("Image selected="+object.Name);	
				if(object.DataSource !=="")
				{
					$scope.parentsource=DataSources[DataSources.contains(object.DataSource)];
					urlstring="SourceId="+object.DataSource+"&FoldersOnly="+foldersOnly+"&path="+object.PathFromSource;
				}
				else
				{
					navigator.notification.alert("you must select a Datasource", function(){}, "Add Image");
					return;
				}
			}
			else if(object.hasOwnProperty('Root'))
			{

				// is a datasource entry
				
                $scope.parentobject=object;
                $scope.parentsource=object;
				console.log("DataSource selected="+object.Name);
				foldersOnly=true;  	
				$scope.parentpath=object.Root;
				path=object.Root=="/*"?"":object.Root;		  			
				urlstring="FoldersOnly="+foldersOnly+"&path="+path+"/*";
				if(object.hasOwnProperty('Authinfo') && object.Authinfo.OAuthid.length>0){
					urlstring=urlstring+"&SourceId="+object._id;
                } else {
                    urlstring=urlstring+"&SourceType="+object.Type.Type;
                }
            }
			else
			{
					// is a file entry
					if($scope.parentobject.hasOwnProperty('Root') &&
							($scope.parentobject.Type.Type=='GoogleDrive')
						){
						path=fixupPath(object.id);
					}
					else{
						path=fixupPath(object.name);
					}
									
					//  check the parent object..
					
					// if a datasource, then use sourcetype=
					if($scope.parentobject.hasOwnProperty('Root'))
					{
						if($scope.parentobject.hasOwnProperty('Authinfo') && $scope.parentobject.Authinfo.OAuthid.length>0){
							urlstring="SourceId="+$scope.parentobject._id;
                                                }
						else {
							urlstring="SourceType="+$scope.parentobject.Type.Type;
                                                }
						foldersOnly=true;
					}	
					// if an image use sourceid=
					else {
					    urlstring="SourceId="+$scope.parentsource._id;
					}    
					// add on the fixed part of the url string
					urlstring = urlstring+"&FoldersOnly="+foldersOnly+"&path="+path+"/*";
					console.log("urlstring="+urlstring);
				
			}
		  $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner>'
      }); 
			$http({
				method: 'GET',
				url: 'http://'+$scope.ourserveraddress+"/files?"+urlstring
			}).then(function successCallback(response) 
				{
					if(response.status == 200)
					{
						$scope.files= JSON.parse(JSON.stringify(response.data));	
						console.log("file callback returned "+$scope.files.length+" file entries");	
						// if this is an image object
						if($scope.parentobject.hasOwnProperty('PathFromSource'))
						{
							$scope.files.forEach(
								function(file)
								{
									if($scope.parentobject.PathFromSource.includes('*'))
									{
										Images.forEach(
											function(Image)
											{
												//console.log("comparing \'"+Image.PathFromSource+"\' with \'"+file.name+"\'");
												if(Image.PathFromSource.endsWith(file.name))
												{
													file.selected=true;
													//console.log("\t\tmatched");
												}
											}
										);
									}
									else
									{
										if($scope.parentobject.PathFromSource.endsWith(file.name))
										{
												file.selected=true;
												//console.log("\t\tmatched exact");
										}
									}
								} 
							);
						}
						if(path+'/*' !== '/*'){
							$scope.files.insert(0,{"selected":false,"filetype":"Folder","name":".."});
                                                }
						console.log("file callback after insert has "+$scope.files.length+" file entries");	
						if(opendialog)
						{
							$scope.saveobject['file']=null;
							$scope.openModal('file');	
						}
						else {
							$ionicScrollDelegate.scrollTop(false);					
                                                }
					}
					else
					{
							console.log("http response="+response.status);
					}
					// this callback will be called asynchronously
					// when the response is available
				}, 
				function errorCallback(response) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					console.log("file callback failed "+response);
				});
				$ionicLoading.hide();
  };
    $scope.singleClick=function(callback)
  {
  		alert("in singleclick");
  		if(callback != undefined && callback != null)
  		{
  			callback();
  		}
  }
  $scope.setClickedRow = function(index,type,column){      //function that sets the value of selectedRow to current index
			var i = $scope.selectedRow[type];
			console.log("clicked row="+type+" column="+column);
			switch(i)
			{	
				// click on row already selected
				case index:
					// deselect
					i=null;
					break;
				// not selected		
				default:
					// make selected
					i=index;
			}
		  $scope.selectedRow[type] = i;
  }
  
	$scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
   }

   $scope.doRefresh = function() {
    	console.log('Begin async operation');
    	try 
    	{     
				$scope.reloadData(true);						
			}
			catch(ex)
			{
				alert("refresh ionic failed="+ex);
			}
	};
		
	$scope.deleterow = function(index,type)
	{
			console.log("delete pressed, row="+index+" for type="+type);
			var object=null;
			switch(type)
			{
				case 'viewer':
					object=Viewers[index];
					break;
				case 'datasource':
					object=DataSources[index];
					// check for images using this source
					for(var i=0;i<Images.length;i++)
					{
						if(Images[i].DataSource=== object._id)
						{
							alert("this DataSource is being used by Image "+ Images[i].Name);
							return;
						}
					}
					break;
				case 'image':
					object=Images[index];
					break;					
				case 'tag':
					object=Tags[index];
					object.Name=object.value;
					// check for images using this tag
					for(var i=0;i<Images.length;i++)
					{
						for(var j=0;j<Images[i].Tags.length;j++)
						{
							if(Images[i].Tags[j]=== object._id)
							{
								alert("this Tag is being used by Image "+ Images[i].Name);
								return;
							}
						}
					}			
					// check for viewers using this tag
					for(var i=0;i<Viewers.length;i++)
					{
						for(var j=0;j<Viewers[i].Tags.length;j++)
						{
							if(Viewers[i].Tags[j]=== object._id)
							{
								alert("this Tag is being used by Viewer "+ Viewers[i].Name);
								return;
							}
						}
					}								
					break;																								
			}
			
			var rc=navigator.notification.confirm(
					"Are you sure you want to delete the "+type+" named="+object.Name, 
					function(buttonindex)
					{ 
						if(buttonindex==1)
							dodelete(object,type)
					}
			);
	}
	var dodelete = function(object,type)
	{
		$ionicLoading.show({
       template: '<ion-spinner icon="android"></ion-spinner>'
    }); 
		var urlstring="http://"+$scope.ourserveraddress+"/"+type+"s?id="+object._id;
		
		console.log("delete of "+type+"="+object.Name+"\n url="+urlstring+"\ndata="+JSON.stringify(object));
		$http({
				method: 'DELETE',
				url: urlstring
				}).
			then(function successCallback(response)
				{				
					if(response.status==200)
					{
						console.log("item deleted");
						$scope.doRefresh(false);
						$ionicLoading.hide();
					}
					else
					{
						console.log("item delete failed rc="+response.status);
					}
				}, 
				function errorCallback(response) 
				{
					console.log("delete request failed="+response.status);
				}
			);	
			
	}
  $scope.addeditClicked = function(index,page,classname)
  {
  		console.log(classname+" button clicked on page "+page+" and row="+index);  
  		$scope.modaltype=classname;
  		switch(page)
  		{
  			case 'viewer':
					{
						
						if(index != null)
						{		
							$scope.thisviewer=Viewers[index];
							
							$scope.thisviewer.isActive=Viewers[index].Active?"true":"false";

							$scope.saveobject[page]=JSON.parse(JSON.stringify($scope.thisviewer));
						}
						else
						{
							var v=JSON.parse(JSON.stringify(Viewers[0]));
								v.Name='foo';
								v.Description='bar';
								v.Advance=10;
								v.Active=false;
								v.ImageRefreshRate=30;
								v.Tags=[];

							$scope.thisviewer=v ;				
							$scope.saveobject[page]=null;			
						}
						$scope.parentobject=$scope.thisviewer;						
					}
					break;
				case 'datasource':
					{
						if(index != null)
						{		
							$scope.thisdatasource=DataSources[index];			
							$scope.thisdatasource.isActive=DataSources[index].Active?"true":"false";				
					  	$scope.saveobject[page]=JSON.parse(JSON.stringify($scope.thisdatasource));						
						}
						else
						{
							var v=JSON.parse(JSON.stringify(DataSources[0]));
								v.Name='';
								v.Description='';
								v.Active=false;
								v.Root='/*';
								v.AuthInfo={"OAuth":"","Userid":"","Password":""};
								v.Type={"Type":"File"};
							$scope.thisdatasource=v ;						
							$scope.saveobject[page]=null;			
						}
						$scope.parentobject=$scope.thisdatasource;

					}
					break;
				case 'image':
					{
						if(index != null)
						{		
							$scope.thisimage=Images[index];		
							$scope.saveobject[page]=JSON.parse(JSON.stringify($scope.thisimage));																		
						}
						else
						{
							var v=JSON.parse(JSON.stringify(Images[0]));
								v.Name='';
								v.Description='';
								v.DataSource='';
								v.PathFromSource='/*';
								v.Tags=[];
							$scope.thisimage=v ;	
							$scope.saveobject[page]=null;						
						}
						$scope.parentobject=$scope.thisimage;
					}
					break;
				case 'tag':
					{
						if(index != null)
						{		
							$scope.thistag=JSON.parse(JSON.stringify(Tags[index]));
							$scope.saveobject[page]=JSON.parse(JSON.stringify($scope.thistag));													
						}
						else
						{
							var v={};
								v.value='';
								v.Description='';
							$scope.thistag=v ;
							$scope.saveobject[page]=null;
						}
						$scope.parentobject=$scope.thistag;
					}
					break					
					
  		}
  		$scope.modal[page].show();  	
  }

	
		$scope.reloadData=function(refresh)
		{
	    $ionicLoading.show({
          template: '<ion-spinner icon="android"></ion-spinner>'
      }); 
   					
		$http({
			method: 'GET',
			url: 'http://'+$scope.ourserveraddress+'/tags'
		}).then(function successCallback(response) 
			{
				if(response.status == 200)
				{
					Tags= JSON.parse(JSON.stringify(response.data));
	
					$scope.tags=Tags;

					// this callback will be called asynchronously
					// when the response is available
					$http({
					method: 'GET',
					url: 'http://'+$scope.ourserveraddress+'/datasources'
				   }).then(function successCallback(response) 
					{
						if(response.status == 200)
						{
			
							DataSources= JSON.parse(JSON.stringify(response.data));			          			                             
			
							$scope.dataSources=DataSources;
							$http({
								method: 'GET',
								url: 'http://'+$scope.ourserveraddress+'/viewers'
							}).then(function successCallback(response) 
								{
									if(response.status == 200)
									{
										Viewers= JSON.parse(JSON.stringify(response.data));

										$scope.viewers=Viewers;
										$http({
											method: 'GET',
											url: 'http://'+$scope.ourserveraddress+'/images'
										}).then(function successCallback(response) 
											{
												if(response.status == 200)
												{
													Images= JSON.parse(JSON.stringify(response.data));													

													$scope.images=Images;
													if(refresh == true)
													{
														console.log('Async operation has ended');
												    $scope.$broadcast('scroll.refreshComplete');
												    $ionicLoading.hide();	
													}
												}
												// this callback will be called asynchronously
												// when the response is available
											}, 
											function errorCallback(response) {
												// called asynchronously if an error occurs
												// or server returns response with an error status.
											}); 		
									}
									// this callback will be called asynchronously
									// when the response is available
								}, 
								function errorCallback(response) {
									// called asynchronously if an error occurs
									// or server returns response with an error status.
								}); 							
											}
						// this callback will be called asynchronously
						// when the response is available
					}, 
					function errorCallback(response) {
						// called asynchronously if an error occurs
						// or server returns response with an error status.
					}); 
				}
			}, 
			function errorCallback(response) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			}); 
			$ionicLoading.hide();
		}										

    $scope.onReadySwiper = function (swiper) {

			swiper.on('slideChangeStart', function () {
				console.log('slide start');
			});
		
			swiper.on('onSlideChangeEnd', function () {
				console.log('slide end');
			});		
    };
    
    $ionicModal.fromTemplateUrl('viewermodal.html', 
    	function($ionicModal) 
    	{
    			$scope.modal['viewer'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }
	  );
    $ionicModal.fromTemplateUrl('datasourcemodal.html', 
    	function($ionicModal) 
    	{
    			$scope.modal['datasource'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }		  
		);
		$ionicModal.fromTemplateUrl('imagemodal.html', 
    	function($ionicModal) 
    	{
    			$scope.modal['image'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }		  
		);
		$ionicModal.fromTemplateUrl('tagmodal.html', 
    	function($ionicModal) 
    	{
    			$scope.modal['tag'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }		  
		);		
		$ionicModal.fromTemplateUrl('filemodal.html', 
    	function($ionicModal) 
    	{
    			$scope.modal['file'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }		  
		);		
		$ionicModal.fromTemplateUrl('discoverymodal.html', 
    	function($ionicModal) 
    	{
    	
    			$scope.modal['server'] = $ionicModal;
			}, 
			{    
		    scope: $scope,    
    		animation: 'slide-in-up'
		  }		  
		); 
	 
   $scope.openModal = function(type) {    
    $scope.modal[type].show();
  };
  
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

  
  $scope.closeModal = function(type, obj) {    
    if($scope.saveobject[type]!=null)
    {
    		switch(type)
    		{
    		  case 'viewer':
    		  case 'tag':
    			case 'datasource':
    			case 'image':

								try
								{
									if(obj)
									{
										var src=$scope.saveobject[type]
										Object.keys(src).forEach(
											function(fieldname)
											{
												obj[fieldname]=src[fieldname];
											}
										)
									}
								}
								catch(ex1)
								{
									alert("keys failed="+ex1)
								}

						//}    					
    		   break;    		  
    		   default:
    		   	break;
   		  }
 
    		$scope.saveobject[type]=null    			

    }
   
    $scope.modal[type].hide();
  };
  var updateadd_success= function(response,object,type, refresh)
  {
    //alert("success hide and refresh status="+JSON.stringify(response));
  		var status=response.status;
  		
  		switch(status)
  		{
  			case 201:
					if($scope.modaltype=='add')
						object._id=response.data; 
					console.log("object added, id="+response.data);	
  			case 200:
  				if(refresh)
  				{	  			  				
	  				$scope.modal[type].hide();  				
			    	$scope.doRefresh(true); 
		    	}
  				break;   
  			default:
	 		}
  } 
  var getAddsandDeletes = function(v, Files)
  {
 		var result={};
 		result.value="";
  		result.addedImages=[];
	  	result.deletedImages=[];
	  	console.log("calculating adds and deletes");
    var counter = 0;
		var newname = $scope.parentpath;
    if (newname.includes("*"))
        newname = newname.substring(0, newname.lastIndexOf("*"));    
    result.value=newname
    // v points to current row in the images database list
    // loop thru all the individual files from the file selection list   
    console.log("there are "+ Files.length+" entries to process");
    for(var i=0;i<Files.length;i++) 
    {
    	  var row=Files[i];    	  
        // if the user selected a folder to be used for this image object
        if (row.selected == true && row.filetype == 'Folder' && row.name!=='..')
        {
        		result.value=row.name;
        		console.log("folder for datasource");
        		break;
        } 
        // if this is a FILE
        else if(row.filetype == 'File')
        {
         //console.log("have a file entry "+row.name);
            var add = true;
            for(var q=0;q<Images.length;q++)
            {
            		var IMAGE= Images[q];
            		//console.log("checking for "+IMAGE.PathFromSource+" matches "+row.name);
                if(IMAGE.PathFromSource.endsWith(row.name))
                {
                    // this file was in the list, so don't add
                    add = false;
                    // this image was in the list before
                    // but not currently selected
                    console.log("have a file entry "+row.name+" selected="+JSON.stringify(row));
                    if (!row.selected)
                    {
                        result.deletedImages.push(IMAGE);
                        console.log("requesting delete for image="+IMAGE.Name);
                        break;
                    }
                }
            }; 
            // if this file list file was NOT in the image list already
            if (add)
            {
               // AND this row IS selected
                if (row.selected)
                {
                		console.log("add checking row="+row.name);
                     // save it to be added
                    var io = {}
                    // make sure we don't have generated name collisions                    
                    nameloop: while(true)
                    {
                        io.Name = v.Name + (++counter);
                        for(var i=0;i<Images.length; i++)
                        {
                        	if(Images[i].Name == io.Name)
                        		continue nameloop;
                        }
									      break;
                    } 
                    
                    io.PathFromSource = newname + row.Name+"/*.jpg";
                    io.DataSource = v.DataSource;
                    io.Tags = v.Tags;
                    io.Description=v.Descripion;
                    console.log("requesting add for image="+io.Name+" for selection="+v.Name);
                    result.addedImages.push(io);                     
                }
            } 
        } 
    	};	  
    // update database  info and viewed images list
	
	  return result;	  	
  } 
  var add_update_delete = function(action, urlstring, object,type,refresh)
  {
  
  	var jobject=JSON.parse(JSON.stringify(object));
		delete jobject["$$hashKey"];
		var jsonstring= JSON.stringify(jobject);
  
		switch(action)
		{  		
			// add a new record	  	
			case 'add':  		  		
				console.log("add object url="+urlstring+"\njson-data="+jsonstring);
				$http.post(urlstring,jsonstring).
					then(
						function successCallback(response)
						{
							updateadd_success(response,object,type,refresh)
						}
					);
				break;
				
			// update existing record
			case 'edit':  	  
			  			
				console.log("update object url="+urlstring+"?id="+object._id+"\njson-data="+jsonstring);
				$http.put(urlstring+"?id="+object._id,jsonstring).
					then(
						function successCallback(response)
						{
							updateadd_success(response,object,type,refresh);
						}
					);
				break;	  
					
			// delete existing record
			default:  	  			
				console.log("deleting object url="+urlstring+"?id="+object._id);
				$http.delete(urlstring+"?id="+object._id).
					then(
						function successCallback(response)
						{
							updateadd_success(response,object,type,refresh)
						}
					);
				break; 
		}
  } 

  $scope.saveModal = function(type) 
  { 
			var object=null;   
	//alert("save");
			var urlstring="http://"+$scope.ourserveraddress+"/"+type+'s';

			switch(type)
			{
				case 'viewer':
					object=$scope.thisviewer;
					delete object.TagNames
					break;
				case 'datasource':
					object=$scope.thisdatasource;
					break;
				case 'image':
					object=$scope.thisimage;
					delete object.TagNames	
					delete object.DataSourceName;	
					break;
				case 'tag':
					object=$scope.thistag;
					break;
				case 'file':
					object=$scope.parentobject;
					console.log("there are "+$scope.files.length+" entries in file list");
					var results = getAddsandDeletes(object,$scope.files)
					if(object.hasOwnProperty("PathFromSource"))
					{

						urlstring="http://"+$scope.ourserveraddress+"/images";
						console.log("setting new path for image");
						if(results.value!=="")
							object.PathFromSource=results.value;
							
						if($scope.modaltype ==='edit')
						{
							// now handle and object add/deletes
							results.addedImages.forEach(
								function(ia)
								{
									//alert("adding image entry="+ia.Name);
									console.log("will add a record="+ia.Name);
									add_update_delete('add', urlstring, ia,'image',false);                             
								}
							)
							results.deletedImages.forEach(
								function(ia)
								{
									//alert("removing image entry="+ia.Name);
									console.log("will delete a record="+ia.Name);
									add_update_delete('delete', urlstring, ia,'image',false);  
								}
							)		
					  }		
					}
					else
					{
						object.Root=results.value;
					}	       	
					$scope.closeModal('file',null);
					return;
				default:
					console.log('unexpected type='+type+' in save modal dislog');
					break;
			}  	
			console.log("will "+$scope.modaltype+" a record="+object.Name);
			add_update_delete($scope.modaltype, urlstring, object,type,true);
  };
  
  
  ionicReady().then(function() {
    // Stuff to do when the platform is finally ready.
    //console.log("in ionic_ready");
    do_init();
  });
  
  var do_init = function()
    {
    	//alert("getting address");
    	try{
			 networkinterface.getIPAddress(
					function (ip) 
					{ 
						//alert("have our ip="+ip);
						findServerAddress(ip);
						// load the data now
						//$scope.reloadData(false);
					}//
			 );
			 }
			 catch(ex)
			 {
			 	alert("ni error="+ex);
			 }
    }
});


