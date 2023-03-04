import { pointInPolygon } from './ejercicio.js';

// App
let app;
let stage;

// Holder to store the bunnies
const bunnies = [];
const totalBunnies  = 10;

// Textures 
let textures;
let explosionTextures = [];
let bg;

// Score
let scoreText;
let score = 0;


// Click listener
function printCoordinates(event) {
    // Click pos    
    let click = [event.clientX,event.clientY];

    // Test colision
    let triangle_test = false;

    for (let i = 0; i < totalBunnies; i++) {
      // Test the rabbit
      triangle_test = pointInPolygon(click,bunnies[i].getBounds());

      // If we have found it:
      if(triangle_test) { 
        // Update Score
        updateScore(bunnies[i].getScore()); 
        
        // Run explosion animation
        explode(i,click);

        // Remove bunny
        app.stage.removeChild(bunnies[i]);

        // Create a new one
        let bunny = new Bunny(PIXI.Assets.get("bunny"));
        bunny.cursor = 'pointer';
        bunnies[i] = bunny; 
        app.stage.addChild(bunny);
        break;};
    }
    console.log(triangle_test);
  }

// Explode!
function explode(i,point) {
  let explosion = new PIXI.AnimatedSprite(explosionTextures);
  app.stage.addChild(explosion);
  explosion.x = point[0];
  explosion.y = point[1];
  explosion.anchor.set(0.5);
  explosion.loop = false;
  explosion.rotation = Math.random() * Math.PI;
  explosion.scale.set(2. * bunnies[i].getScaleFactor()  + Math.random() * 1.5);
  explosion.play()
  }

// Click listener
document.addEventListener("click", printCoordinates);

// Bunny Class
class Bunny extends PIXI.Sprite {
    constructor(texture, name = "none"){
        super(texture);
        // Set the initial position and other bunny prop. 
        this.anchor.set(0.5);
        this.x = Math.random() * app.screen.width;
        this.y = Math.random() * app.screen.height;
        this.name = name;
        this.speed = 2 + Math.random() * 4;
        this.direction = Math.random() * Math.PI * 2;
        this.scale_faactor = Math.random() * 1.5;
        this.score = Math.round((1./this.scale_faactor)*50);
        this.scale.x *= this.scale_faactor;
        this.scale.y *= this.scale_faactor;
        this.turningSpeed = Math.random() - 0.8;
        this.boundsPadding = 0;
        this.reshapeBoundingBounds();
    }

    // Reshape bounding box after window resize
    reshapeBoundingBounds() {
        this.bounds = new PIXI.Rectangle(-this.boundsPadding,
                                         -this.boundsPadding,
                                          app.screen.width + this.boundsPadding * 2,
                                          app.screen.height + this.boundsPadding * 2);
    }

    // Returns score for this bunny
    getScore() {
      return this.score;
    }

    // Returns the scale factor
    getScaleFactor() {
      return this.scale_faactor;
    }
    
    // Updates one step
    move() {
        // Move one step
        this.direction += this.turningSpeed * 0.01;
        this.x         += Math.sin(this.direction) * this.speed;
        this.y         += Math.cos(this.direction) * this.speed;
        this.rotation   = -this.direction - Math.PI / 2;

        // Wrap the bunny by testing windows bounds...
        if (this.x < this.bounds.x) {
            this.x += this.bounds.width;
        } else if (this.x > this.bounds.x + this.bounds.width) {
            this.x -= this.bounds.width;
        }

        if (this.y < this.bounds.y) {
            this.y += this.bounds.height;
        } else if (this.y > this.bounds.y + this.bounds.height) {
            this.y -= this.bounds.height;
        }
    }
    
    // Returns  boundary
    getBounds() {
        // Use builtin bounding box feature
        let polygon   = super.getBounds(true);

        // Vertices
        let vertices = [];
        vertices.push({x:polygon.x, y:polygon.y});
        vertices.push({x:polygon.x+polygon.width, y:polygon.y});
        vertices.push({x:polygon.x+polygon.width, y:polygon.y+polygon.height});
        vertices.push({x:polygon.x, y:polygon.y+polygon.height});
        
        return vertices;
    }
}

// Update score after click
function updateScore(newScore) {
    score += newScore;
    scoreText.text = `Score: ${score}`;
}

// Game loop
function gameLoop(delta) {
    // Move bunnies
    for (let i = 0; i < totalBunnies; i++) {
      bunnies[i].move();      
    }

    // Move background
    bg.tilePosition.x += 1;
    bg.tilePosition.y += 1;
}

// Windows resize
function resizeHandler() {
    // New size
    const newWidth  = window.innerWidth;
    const newHeight = window.innerHeight;
    
    // Resize canvas 
    app.renderer.view.style.width = `${newWidth}px`;
    app.renderer.view.style.height = `${newHeight}px`;
    app.renderer.resize(newWidth, newHeight);

    // Update bunnies
    for (let i = 0; i < totalBunnies; i++) {
      bunnies[i].reshapeBoundingBounds();
    }

    // Update background
    bg.width  = newWidth;
    bg.height = newHeight;
  };

// Create the scene elements 
function createScene() {
    // Main scene element
    stage = new PIXI.Container();

    // Set up background
    bg = new PIXI.TilingSprite(PIXI.Assets.get("grass"), app.screen.width, app.screen.height);
    app.stage.addChild(bg);

    // Create bunnies
    for (let i = 0; i < totalBunnies; i++) {
      // Create
      let bunny = new Bunny(PIXI.Assets.get("bunny"));
      // Shows hand cursor
      bunny.cursor = 'pointer';
      bunnies.push(bunny);
      app.stage.addChild(bunny);
    }

    // Score text
    scoreText = new PIXI.Text(`Score: ${score}`);
    scoreText.style = new PIXI.TextStyle({
      fontFamily: "PublicPixel",
      fontSize: 30,
      fill: 0xFFFFFF,
    });
    scoreText.position.set(10, 10);
    app.stage.addChild(scoreText);

    // Explosion
    // Create an explosion AnimatedSprite

}

//  After loading the sprites
function doneLoading(textures) {
    // Create scene elements
    createScene();

    // Resize canvas to fit window size
    resizeHandler();

    //Launch game!
    app.ticker.add(gameLoop)
}

// Load game
window.onload = function() { 
    // Create app
    app = new PIXI.Application({ background: '#288C22' });

    // Add view to scene and register resize event
    document.body.appendChild(app.view);
    window.addEventListener('resize', resizeHandler, false);

    // Load sprites
    PIXI.Assets.load('assets/mc.json').then(() => {
      // Store the textures      
      let i;  
      for (i = 0; i < 26; i++) {
          const animated_texture = PIXI.Texture.from(`Explosion_Sequence_A ${i + 1}.png`);
          explosionTextures.push(animated_texture);
      }

      PIXI.Assets.add('bunny', 'assets/bunny_sprite.png');
      PIXI.Assets.add('grass', 'assets/grass.png');
        
      // Load more if needed
      // ...
  
      // Load the assets and get a resolved promise once both are loaded
      const spritesPromise = PIXI.Assets.load(['bunny','grass']);
      spritesPromise.then(doneLoading);

    });
  

};






