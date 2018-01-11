float a, b, m, n1, n2, n3;
float highestRadius = 0;
int padding = 20;
boolean invert;
boolean cli_mode = true;
String mode;
String filename; 

void setup() {
  // Set canvas size to maximum size for 'expanded' image format on Twitter
  size(1024,512);
  
  // Set up 2D rendering environmental settings
  smooth();
  noFill();
  
  // Get arguments from CLI interface  
  if(args != null && args.length > 0) {
    switch(args.length) {
      // [m, n1, n2, n3]
      case 4:
        a = 1;
        b = 1;
        m = float(args[0]);
        n1 = float(args[1]);
        n2 = float(args[2]);
        n3 = float(args[3]);
        break;
       
      // [m, n1, n2, n3, invert]
      case 5:
        a = 1;
        b = 1;
        m = float(args[0]);
        n1 = float(args[1]);
        n2 = float(args[2]);
        n3 = float(args[3]);
        invert = boolean(args[4]);
        break;
        
      // [a, b, m, n1, n2, n3]
      case 6:
        a = float(args[0]);
        b = float(args[1]);
        m = float(args[2]);
        n1 = float(args[3]);
        n2 = float(args[4]);
        n3 = float(args[5]);
        break;
        
      // [a, b, m, n1, n2, n3, invert] 
      case 7:
        a = float(args[0]);
        b = float(args[1]);
        m = float(args[2]);
        n1 = float(args[3]);
        n2 = float(args[4]);
        n3 = float(args[5]);
        invert = boolean(args[6]);
        break;
        
      // Reject all other cases
      default:
        exit();
        break;
    }
  } else {
    // Randomize parameters when not in CLI mode 
    a = random(0.01, 4.0);
    b = random(0.01, 4.0);
    m = random(0.0, 40.0);
    n1 = random(0.01, 20.0);
    n2 = random(0.01, 20.0);
    n3 = random(0.01, 5.0);
    cli_mode = false;
    invert = false;
  }
  
  // Get all vertices for shape
  PVector[] points = superformula(a, b, m, n1, n2, n3);
  
  pushMatrix();
    // Set up color palette based on 'invert' arg
    if(invert) {
      background(20);
      stroke(255);
    } else {
      background(255);
      stroke(0);
    }

    // Draw params for debug
    //textSize(16);
    //fill(0);
    //text(a, 5, 20);
    //text(b, 5, 40);
    //text(m, 5, 60);
    //text(n1, 5, 80);
    //text(n2, 5, 100);
    //text(n3, 5, 120);
    //text(highestRadius, 5, 140);
    //noFill();
    
    // Draw shape in center of canvas
    translate(width/2, height/2);

    // Draw supershape
    beginShape();
      curveVertex(map(points[points.length-1].x, 0, highestRadius, 0, height/2 - padding), map(points[points.length-1].y, 0, highestRadius, 0, height/2 - padding));
      
      for(int i=0; i<points.length; i++) {
        curveVertex(map(points[i].x, 0, highestRadius, 0, height/2 - padding), map(points[i].y, 0, highestRadius, 0, height/2 - padding));
      }
      
      curveVertex(map(points[0].x, 0, highestRadius, 0, height/2 - padding), map(points[0].y, 0, highestRadius, 0, height/2 - padding));
      
    endShape(CLOSE);
  popMatrix();
  
  // Save the generated image
  save("output.jpg");
    
  // Exit Processing to free up resources
  if(cli_mode) {
    exit();
  }
}


/**
 * Visualize: Superformula
 * from Form+Code in Design, Art, and Architecture 
 * by Casey Reas, Chandler McWilliams, and LUST
 * Princeton Architectural Press, 2010
 * ISBN 9781568989372
*/
PVector[] superformula(float a, float b, float m, float n1, float n2, float n3) {
  int numPoints = 360;
  float phi = TWO_PI / numPoints;
  PVector[] points = new PVector[numPoints + 1];
  
  for(int i=0; i<=numPoints; i++) {
    points[i] = superformulaPoint(a,b,m,n1,n2,n3,phi*i);
  }
  
  return points;
}

PVector superformulaPoint(float a, float b, float m, float n1, float n2, float n3, float phi) {
  float r;
  float t1,t2;
  float x = 0;
  float y = 0;
  float radius;

  t1 = cos(m * phi / 4) / a;
  t1 = abs(t1);
  t1 = pow(t1,n2);

  t2 = sin(m * phi / 4) / b;
  t2 = abs(t2);
  t2 = pow(t2,n3);

  r = pow(t1 + t2, 1/ n1);
  
  if (abs(r) == 0) {
    x = 0;
    y = 0;
  }  
  else {
    r = 1 / r;
    x = r * cos(phi);
    y = r * sin(phi);
    
    radius = sqrt(x*x + y*y);
    if(radius > highestRadius)  highestRadius = radius;
  }

  return new PVector(x,y);
}