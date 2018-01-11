float a, b, m, n1, n2, n3, decay;
int iterations;
float largestRadius = 0;
int padding = 40;
boolean invert = false;
boolean cli_mode = true; 

void setup() {
  // Set canvas size to maximum size for 'expanded' image format on Twitter
  size(800,800);
  
  // Set up 2D rendering environmental settings
  smooth();
  hint(ENABLE_STROKE_PURE);
  noFill();
  
  // Get arguments from CLI interface  
  if(args != null && args.length > 0) {
    a = float(args[0]);
    b = float(args[1]);
    m = float(args[2]);
    n1 = float(args[3]);
    n2 = float(args[4]);
    n3 = float(args[5]);
    iterations = int(args[6]);
    decay = float(args[7]);
    invert = boolean(args[8]);
    
  // Randomize parameters when not in CLI mode
  } else {
    a = random(0.01, 4.0);
    b = random(0.01, 4.0);
    m = random(0.0, 40.0);
    n1 = random(0.01, 20.0);
    n2 = random(0.01, 20.0);
    n3 = random(0.01, 5.0);
    iterations = int(random(1,10));
    decay = map(iterations, 1, 10, .05, .2);
    invert = false;
    
    cli_mode = false;
  }
  
  // Set up color palette based on 'invert' arg
  if(invert) {
    background(20);
    stroke(255,200);
  } else {
    background(245);
    stroke(0,135);
  }

  // Draw shape in center of canvas
  translate(width/2, height/2);
  
  for(int i=iterations; i>0; i--) {
    // Get all vertices for shape
    largestRadius = 0;
    PVector[] points = superformula(a - i*decay, b - i*decay, m, n1 - i*decay, n2 - i*decay, n3 - i*decay);
    
    beginShape();      
      for(int j=0; j<points.length; j++) {
        curveVertex(
          map(points[j].x, 0, largestRadius, 0, height/2 - padding), 
          map(points[j].y, 0, largestRadius, 0, height/2 - padding)
        );
      }
    endShape();
  }
  
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
    
    if(radius > largestRadius)  
      largestRadius = radius;
  }

  return new PVector(x,y);
}