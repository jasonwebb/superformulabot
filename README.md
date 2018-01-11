    Bot is currently OFFLINE while initial development is being done.

[Superformulabot](https://twitter.com/superformulabot) is a generative art Twitter bot by [Jason Webb](http://jasonwebb.io) that shares drawings created using the 2D [superformula](https://en.wikipedia.org/wiki/Superformula) equation.

Once per hour at a randomized time a new drawing is generated and shared based on the current timestamp. 

Anyone can request a specific drawing be made for them by @mentioning the bot with a message containing a well-formed parameter string. The bot will reply with the interpreted parameters and the render drawing, or an error message describing what went wrong.

## Usage 

    @superformulabot [a:# b:# m:# n1:# n2:# n3:# iterations:# decay:# invert:#]

All parameters are optional, and will default to values in the following table - feel free to provide as many or as few as you'd like!

| Parameter | Type    | Description | Range | Default |
|---        |---      |---          |---    |---      |
| `a`       | float   |             | 0.01 - 8.0 |
| `b`       | float   |             | 0.01 - 8.0 |
| `m`       | float   | Degree of rotational symmetry | 1.0 - 20.0 |
| `n1`      | float   | Affects convexity/concavity of edges, resulting 'bloated' or 'pinched' shapes            | 0.01 - 40.0 |
| `n2`      | float   | Similar to n1 | 0.01 - 40.0 |
| `n3`      | float   | Similar to n2 | 0.01 - 40.0 |
| `iterations` | int  | Number of concentric drawings | 1 - 10 | Random in range |
| `decay`   | float   | Amount of change to parameters per iteration | 0.05 - 0.2 | `iterations` mapped to range |
| `invert`  | boolean | Invert colors | - | false |

## Examples

## Technologies used
* [Node.js](https://nodejs.org)
* [Twit](https://github.com/ttezel/twit)
* [Processing 3.3.6](https://processing.org/) via [CLI](https://github.com/processing/processing/wiki/Command-Line) - _not included in this repo for size reasons_
* [Zeit](https://zeit.co) via [now](https://www.npmjs.com/package/now)

## References
* [Daniel Shiffman's Programming A-Z course](http://shiffman.net/a2z/twitter-bots/)
* [Paul Bourke's article on effects of parameters](http://paulbourke.net/geometry/supershape/)