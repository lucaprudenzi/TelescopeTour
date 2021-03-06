var renderer, scene, camera, labelRenderer,capturer;
var sphere, pivot, group, pano, light, cloud;
var clock = new THREE.Clock();
var textureLoader = new THREE.TextureLoader();

var points=[];
var array_image = [];
var array_label = [];
var array_label_position_up = [];
var array_label_position_down = [];
var count = 0;
var radius = 100;
var i = 0;

var dilatation = 10; //set to high value for ccpacture, 1 otherwise
var velocity_first = dilatation*10000;
var velocity = dilatation*3000;
var capture_on = 1; // 1 for capture, 0 otherwise

// data
var long=[-174-39/60-46/3600,
-149-33/60-53/3600,
-149-5/60-58/3600,
-147-26/60-25/3600,
-133-48/60-35/3600,
-121-8/60-9/3600,
-102-47/60-45/3600,
-102-14/60-2/3600,
-87-10/60-41/3600,
-27-41/60-7/3600,
-41-33/60-54/3600,
-21-50/60-50/3600,
-18-33/60-50/3600,
-11-55/60-4/3600,
-6-35/60-38/3600,
-6-53/60-1/3600,
-6-23/60-46/3600,
2+18/60+14/3600,
-11-38/60-49/3600,
-14-59/60-20/3600,
3+5/60+12/3600,
64+35/60+1/3600,
71+59/60+11/3600,
79+50/60+23/3600,
91+34/60+26/3600,
103+56/60+41/3600,
106+14/60+44/3600,
107+37/60+6/3600,
108+7/60+9/3600,
111+36/60+44/3600,
118+16/60+37/3600,
119+40/60+59/3600,
155+27/60+19/3600];

var lat=[-36-25/60-59.4/3600,
-30-18/60-46.4/3600,
-31-16/60-4.1/3600,
-42-48/60-12.9/3600,
-31-52/60-3.7/3600,
31+5/60+31.6/3600,
25+1/60+38.4/3600,
51+46/60+12.9/3600,
43+28/60+17.4/3600,
-25-53/60-23.1/3600,
43+47/60+16.1/3600,
57+33/60+33.5/3600,
53+5/60+43.7/3600,
57+23/60+35.1/3600,
52+54/60+55.1/3600,
50+31/60+29.4/3600,
52+48/60+43/3600,
53+14/60+2.3/3600,
44+31/60+13.8/3600,
36+52/60+33.8/3600,
40+31/60+28.8/3600,
17+45/60+23.7/3600,
42+56/60+1.0/3600,
38+25/60+59.3/3600,
41+46/60+17.1/3600,
30+38/60+6.1/3600,
35+46/60+30.4/3600,
34+4/60+43.7/3600,
34+18/60+3.7/3600,
31+57/60+22.7/3600,
37+13/60+53.9/3600,
48+7/60+52.4/3600,
19+48/60+5.0/3600];

var telescope=["Warkworth Astronomical Observatory",
"Australia Telescope Compact Array",
"Mopra Radio Telescope",
"Mount Pleasant Radio Observatory",
"Ceduna Radio Observatory",
"Tianma Radio Telescope",
"Yunnan Astronomical Observatory",
"Badary Astronomical Observatory",
"Xinjiang Astronomical Observatory",
"Hartebeesthoek Observatory",
"Zelenchukskaya Observatory" ,
"Ventspils Radio Astronomy Centre",
"Toruń Centre for Astronomy",
"Onsala Space Observatory",
"Westerbork Radio Telescope",
"Effelsberg Radio Telescope",
"Joint Institute for VLBI ERIC",
"Mark II Radio Telescope",
"Medicina Radio Telescope",
"Noto Radio Observatory",
"Yebes Observatory",
"VLBA (St. Croix)",
"VLBA (Hancock)",
"Green Bank Telescope",
"VLBA (North Liberty)",
"VLBA (Fort Davis)",
"VLBA (Los Alamos)",
"Very Large Array",
"VLBA (Pie Town)",
"VLBA (Kitt Peak)",
"VLBA (Owens Valley)",
"VLBA (Brewster)",
"VLBA (Mauna Kea)"]


init();
render();


function init() {
    if (capture_on){
			capturer = new CCapture({ 
				  format: 'webm',
					framerate: 45,
			});
		}
    
	  renderer = new THREE.WebGLRenderer();
	  renderer.setSize(window.innerWidth, window.innerHeight);
    canvas = document.body.appendChild(renderer.domElement);
    
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 10000);
    camera.position.set(-300, 0, -300);
	  camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    camera_control = new THREE.OrbitControls(camera);
    camera_control.minDistance = 100;
	  camera_control.maxDistance = 1500;
    camera_control.rotateSpeed = 1.0;
    camera_control.zoomSpeed = 1.2;
    camera_control.panSpeed = 0.8;

    var geometry = new THREE.SphereGeometry(radius, 64, 64)
    var material = new THREE.MeshPhongMaterial({
        map: textureLoader.load('images/8k_earth.jpg'),
        bumpMap: textureLoader.load('images/elev_bump_4k.jpg'),
        bumpScale: 1,
        specularMap: textureLoader.load('images/water_4k.png'),
        specular: new THREE.Color('grey')
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    cloud_geometry = new THREE.SphereGeometry(radius+1.5, 32, 32),
    cloud_material = new THREE.MeshPhongMaterial({
        map: textureLoader.load('images/fair_clouds_4k.png'),
        transparent: true
    })
    cloud = new THREE.Mesh(cloud_geometry, cloud_material)
    scene.add(cloud)
    var geometry_stars = new THREE.SphereGeometry(800, 32, 32);
    var material_stars = new THREE.MeshBasicMaterial({
	    map: textureLoader.load('images/galaxy_starfield.png'),
	    side: THREE.BackSide
    });
    stars_sphere = new THREE.Mesh(geometry_stars, material_stars);
    stars_sphere.position.y = 0;
    scene.add(stars_sphere);
    
    // Light
    scene.add(new THREE.AmbientLight(0xcccccc));
    //scene.add(new THREE.AmbientLight(0xffffff));
    var light = new THREE.DirectionalLight(0xffffff, 0.15);
    light.position.set(800,400,800);
    scene.add(light);
    
    var dotGeometry = new THREE.SphereGeometry(0.5,32,32);
    var dotMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    
    group = new THREE.Object3D();
    
    for (var i = 0; i < telescope.length; i++){
        theta = adjustLat(lat[i])
        phi = adjustLong(long[i])
        
        // white dot
        dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.z=radius*Math.sin(theta/180*Math.PI)*Math.sin(phi/180*Math.PI);
        dot.position.x=radius*Math.sin(theta/180*Math.PI)*Math.cos(phi/180*Math.PI);
        dot.position.y=radius*Math.cos(theta/180*Math.PI);
        
        // image position
        dot_up = new THREE.Mesh(dotGeometry, dotMaterial);
        dot_up.position.z=(radius+20)*Math.sin(theta/180*Math.PI)*Math.sin(phi/180*Math.PI);
        dot_up.position.x=(radius+20)*Math.sin(theta/180*Math.PI)*Math.cos(phi/180*Math.PI);
        dot_up.position.y=(radius+20)*Math.cos(theta/180*Math.PI);
        
        // camera position
        dot_upp = new THREE.Mesh(dotGeometry, dotMaterial);
        dot_upp.position.z=(radius+80)*Math.sin(theta/180*Math.PI)*Math.sin(phi/180*Math.PI);
        dot_upp.position.x=(radius+80)*Math.sin(theta/180*Math.PI)*Math.cos(phi/180*Math.PI);
        dot_upp.position.y=(radius+80)*Math.cos(theta/180*Math.PI);
        
        // label position down
        dot_uppp = new THREE.Mesh(dotGeometry, dotMaterial);
        dot_uppp.position.z=(radius+15)*Math.sin(theta/180*Math.PI)*Math.sin(phi/180*Math.PI);
        dot_uppp.position.x=(radius+15)*Math.sin(theta/180*Math.PI)*Math.cos(phi/180*Math.PI);
        dot_uppp.position.y=(radius+15)*Math.cos(theta/180*Math.PI);
        
        // label position up
        dot_upppp = new THREE.Mesh(dotGeometry, dotMaterial);
        dot_upppp.position.z=(radius+25)*Math.sin(theta/180*Math.PI)*Math.sin(phi/180*Math.PI);
        dot_upppp.position.x=(radius+25)*Math.sin(theta/180*Math.PI)*Math.cos(phi/180*Math.PI);
        dot_upppp.position.y=(radius+25)*Math.cos(theta/180*Math.PI);
        
        sprite_image = "images/telescopes/"+i+".jpg";
        //console.log(sprite_image);
        
        sprite_material = new THREE.SpriteMaterial({
            map: textureLoader.load(sprite_image)
        });
        sprite = new THREE.Sprite(sprite_material);
        sprite.position.set(dot_up.position.x,dot_up.position.y,dot_up.position.z);
        sprite.scale.set(10, 10, 1)
        
        dot_label = makeTextSprite( telescope[i], 
            { fontsize: 30, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
        dot_label.position.set(dot_uppp.position.x,dot_uppp.position.y,dot_uppp.position.z);
        //dot_label.scale.set(15, 15, 15)

        group.add(dot);
        points.push(dot_upp.position);
        array_label_position_up.push(dot_upppp.position);
        array_label_position_down.push(dot_uppp.position);
        array_image.push(sprite);
        array_label.push(dot_label.position);
        group.add(dot_label);
    }

    var final_point = new THREE.Vector3(350,0,350);
    array_label[0].set(array_label_position_up[0].x,array_label_position_up[0].y,array_label_position_up[0].z);
    points.push(final_point);
    pivot = new THREE.Group();
    scene.add(pivot);
    pivot.add(group);
    if (capture_on){
			capturer.start();
		}
    scene.add(array_image[0]);
    tweenCamera(points[0],velocity_first);

}

function adjustLat(lat){
    return 90-lat;
}

function adjustLong(long){
    return long;
}

function tweenCamera(target,duration){
    
    new TWEEN.Tween( camera.position )
        .to(target, duration)
        .onUpdate( function () {
        })
        .easing(TWEEN.Easing.Quadratic.InOut)
        
        .onComplete( function () {
            count = count+1;
            tweenCamera(points[count],velocity)    
            if (count<points.length){
                array_label[count-1].set(array_label_position_down[count-1].x,array_label_position_down[count-1].y,array_label_position_down[count-1].z);
                scene.remove(array_image[count-1]);
                if (count<points.length-1){
                    array_label[count].set(array_label_position_up[count].x,array_label_position_up[count].y,array_label_position_up[count].z);
                    scene.add(array_image[count]);
                }
            }
            if (capture_on){
							if (count == points.length+1){
  							capturer.stop();
								capturer.save();
							}
            }
        })
        .delay(0)
        .start();
    if (count==points.length){
        return;
    }
}

function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 20;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

    var canvas = document.createElement('canvas');
    canvas.width = 612;
    canvas.height = 300;
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);

    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
    var sprite = new THREE.Sprite( spriteMaterial );
    //sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    sprite.scale.set(0.8 * fontsize, 0.4 * fontsize, 1.2 * fontsize);
    //sprite.scale.set(0.02 * canvas.width, 0.025 * canvas.height);    
    return sprite;  
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}

function render() {
    time_new = clock.getElapsedTime();
    camera_control.update();
    //console.log(count)
    //console.log(points.length)
    cloud.rotation.y += 0.0002;
    if (count>=points.length){
        cloud.rotation.y += 0.0011;
        sphere.rotation.y += 0.001;
        pivot.rotation.y += 0.001;
    }
    
    TWEEN.update();
    
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (capture_on){
			capturer.capture(canvas);
		}
}
