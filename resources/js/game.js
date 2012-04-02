window.onload = function() {
	//start crafty
	
	var o2Count = '0';
	var scene_number = 0;
	
	var scene1 = new Array(2);
	scene1[0] = [0,0,0,0,0,0,0,0,0,0,2];
	scene1[1] = [0,0,0,0,0,0,0,0,0,0,0];
	scene1[2] = [0,0,0,0,0,0,0,0,0,0,0];
	scene1[3] = [0,0,0,0,0,4,4,4,4,4,4];
	
	Crafty.init(704, 256);
	Crafty.canvas.init();
	
	//turn the sprite map into usable components
	Crafty.sprite(64, "resources/sprites/spritesmars.png", {
		grass1: [3,0],
		rock1:  [4,0],
		player: [1,0],
		grass2: [3,1],
		border1: [4,1],
		ship: [5,1],
		border2: [6,1],
		border3: [4,2],
	});
	Crafty.sprite(32, "resources/sprites/gunicon.png", { 
		o2gem: [0,0]
	});
	Crafty.sprite(64, "resources/sprites/digsprite.png", { 
		digsprite: [0,0]
	});
	Crafty.sprite(64, "resources/sprites/dialog.png", { 
		dialog1: [0,0],
		dialog2: [1,0],
		dialog3: [2,0],
		dialog4: [3,0],
		dialog5: [4,0],
		dialog6: [5,0],
		dialog7: [0,1],
		dialog8: [1,1],
		dialog9: [2,1],
		dialog10: [3,1],
		dialog11: [4,1],
		dialog12: [5,1],
		
		dialog13: [0,2],
		dialog14: [1,2],
		dialog15: [2,2],
		dialog16: [3,2],
		dialog17: [4,2],
		dialog18: [5,2],
		
		dialog19: [0,3],
		dialog20: [1,3],
		dialog21: [2,3],
		dialog22: [3,3],
		dialog23: [4,3],
		dialog24: [5,3],
	
		
		
	});

	function generateWorld() {
		
		tiles = [];	
			
		//generate the grass along the x-axis
		
		for(var i = 0; i < 11; i++) {
			//generate the grass along the y-axis
			for(var j = 0; j < 4; j++) {
				
				switch(scene1[j][i]){
					case 0:
						var rock = Crafty.e("2D, Canvas, grass1").attr({x: i * 64, y: j * 64});
						tiles.push(rock);
						break;
					case 1:						
						var rock = Crafty.e("2D, Canvas, border1,solid,collision").attr({x: i * 64, y: j * 64});
						break;
					case 2:						
						var rock = Crafty.e("2D, Canvas, ship, shipinterface").attr({x: i * 64, y: j * 64});
						break;
					case 3:						
						var rock = Crafty.e("2D, Canvas, dialog1,solid,collision").attr({x: i * 64, y: j * 64});
						break;
					case 4:						
						var rock = Crafty.e("2D, Canvas, border3").attr({x: i * 64, y: j * 64});
						break;
				}
					
				//1/50 chance of drawing a flower and only within the bushes
				if(i > 0 && i < 11 && j > 0 && j < 4 && Crafty.math.randomInt(0, 25) > 24) {
					
					volcanos = Crafty.e("2D, Canvas, rock1, solid, SpriteAnimation")
						.attr({x: i * 64, y: j * 64})
						.animate("volcano", 4, 0, 5)
						.bind("EnterFrame", function() {
							if(!this.isPlaying())
								this.animate("volcano", 150 );
						});
				}
			}
		}
		
	}
	function gotoScene(scn) {
		Crafty.scene("scene"+scn, function() {
			if(player.x>=704){
				player.attr({x: 0});
			}else if(player.x<=0){
				player.attr({x: 704});
			}else if(player.y<=0){
				player.attr({y: 256});
			}else if(player.y>=256){
				player.attr({y: 0});
			}
			generateWorld();
		});
		Crafty.scene("scene"+scn);
	}
	function digSoil(px,py){
		px = Math.ceil(px/64)*64;
		py = Math.ceil(py/64)*64;
		
		for(var i = 0; i < tiles.length; i++) {
			if( (px==tiles[i].x) && (py==tiles[i].y) ){
				Crafty.e("2D, Canvas, digsprite").attr({x: px, y: py});  //add dig animation 
				tiles[i].attr({'alpha':.5}); //change the tiles darkness
			}
		}
	}

	//the loading screen that will display while our assets load
	Crafty.scene("loading", function() {
		//load takes an array of assets and a callback when complete
		Crafty.load(["resources/sprites/spritesmars.png","resources/sprites/gunicon.png","resources/sprites/ship.png"], function () {
			Crafty.scene("main"); //when everything is loaded, run the main scene
		});
		
		//black background with some loading text
		Crafty.background("#000");
		Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
			.text("Barnabus Mars Loading..")
			.css({"text-align": "center","color":"#0xFFFFFF"});
	});
	
	Crafty.scene("loading"); //automatically play the loading scene
	
	Crafty.scene("main", function() {
		generateWorld();
		
		
		Crafty.c('shipinterface', { 
			init: function() {		
				this.requires("SpriteAnimation, Collision")
				
				Crafty.e("2D, Canvas").attr({x: 5, y: 5, z: 1});  //Shows Oxygen Gem Sprite
			},		
		});
		
		Crafty.c('gameinterface', { 
			init: function() {		
				Crafty.e("2D, Canvas, o2gem, Persist").attr({x: 17, y: 220, z: 1});  //Shows Oxygen Gem Sprite
				o2text = Crafty.e("2D, DOM, Text,Persist").attr({x: 46, y: 227, z: 1}).text('0').css({"font-family": "Tahoma","font-size":"12px","font-weight":"bold","color":"white"});  					},	
			addOxygen: function(e) {
				o2text.text(e);
			}	
		});
		
		Crafty.c('Hero', {
			init: function() {
					
					_o2level = 0;
					
					//setup animations
					this.requires("SpriteAnimation, Collision, gameinterface")
					.animate("walk_left", 0, 1, 2)
					.animate("walk_right", 0, 2, 2)
					.animate("walk_up", 0, 3, 2)
					.animate("walk_down", 0,0, 2)
					//change direction when a direction change event is received
					.bind("NewDirection",
						function (direction) {
							
							if (direction.x < 0) {
								if (!this.isPlaying("walk_left"))
									this.stop().animate("walk_left", 5, -1);
							}
							if (direction.x > 0) {
								if (!this.isPlaying("walk_right"))
									this.stop().animate("walk_right", 5, -1);
							}
							if (direction.y < 0) {
								if (!this.isPlaying("walk_up"))
									this.stop().animate("walk_up", 5, -1);
							}
							if (direction.y > 0) {
								if (!this.isPlaying("walk_down"))
									this.stop().animate("walk_down", 5, -1);
							}
							if(!direction.x && !direction.y) {
								this.stop();
							}
					})
					// A rudimentary way to prevent the user from passing solid areas
					.bind('KeyDown', function(e) {
                		if(e.keyCode===32){
                			//start mining
                			_o2level++;
                			_o2level.toString();
                			Crafty('gameinterface').addOxygen(_o2level);
                			if(!this._digging){
	                			digSoil(this._x,this._y);
                			}
                			 	
                		}
      				})
					.bind('Moved', function(from) {
						if( (from.x < -64) || (from.x > 704) || (from.y < -64) || (from.y > 256) ) {
						
							gotoScene(1);
						
						}
						if(this.hit('solid')){
							this.attr({x: from.x, y:from.y});
						}
						if(this.hit('ship')){
							console.log("ENTER SHIP");
							Crafty.scene("shipinterior",function(){ 
								Crafty.background("#000");
		Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 64, y: 128})
			.text("SHIP INTERIOR SCENE")
			.css({"text-align": "center","color":"white"});

							});
							Crafty.scene("shipinterior");
						}
					});
				return this;
			}
		});

		Crafty.c("gamecontrols", {
			init: function() {
				this.requires('Fourway');
			},

			gamecontrols: function(speed) {
				this.fourway(speed, {W: -90, S: 90, D: 0, A: 180})
				return this;
			},
		});
						
		//create our player entity with some premade components
		player = Crafty.e("2D, Canvas, player, gamecontrols, Hero, Animate, Collision, gameinterface, Persist")
			.attr({x: 256, y: 128, z: 1})
			.gamecontrols(2)
			});
};