    Bot is currently OFFLINE while initial development is being done.

__[@superformulabot](https://twitter.com/superformulabot)__ is a generative art Twitter bot by [Jason Webb](https://twitter.com/jasonwebb) that shares drawings created using the 2D [superformula](https://en.wikipedia.org/wiki/Superformula) equation.

Once per hour (+/- up to 15min) a new drawing is automatically generated and tweeted based using the current timestamp as parameters. 

Anyone can request a specific drawing be made for them by @mentioning the bot with a message containing a set of parameters (see [Usage](#usage)). The bot will generate a new drawing using the provided parameters, using randomized values for any that are not provided, then reply to the user with the drawing.

## Usage 
To request a custom drawing from the bot, __@mention__ it in a tweet containing a list of parameters in the format of `[... {key}:{value} ...]`. For example:

    @superformulabot [a:# b:# m:# n1:# n2:# n3:# iterations:# decay:# invert:#]

All parameters are optional and will be randomized within the ranges below if they are not explicitly provided. Provide as many or as few as you'd like!

* If no parameters are provided (`[]`), or if anything other than valid key/value pairs are provided (e.g `[schwifty]`), all parameters will be randomized within the ranges below. 
* If a mix of valid parameters and non-valid parameters are provided (e.g. `[m:10 schwifty]`), all non-valid parameters will be randomized.

All __@mentions__ that do not include at least an empty parameter set (`[]`) will be silently ignored so that you can talk about the bot without triggering it.

You can rapidly find interesting forms and parameters using an interactive tool like this [Superformula Explorer](https://bl.ocks.org/mbostock/1021103) by Mike Bostock.


| Parameter | Type      | Description | Range |
|---        |---        |---          |---    |
| `a`       | _float_   | Lateral stretch amount | 0.01 - 8.0 |
| `b`       | _float_   | Vertical stretch amount | 0.01 - 8.0 |
| `m`       | _float_   | Degree of rotational symmetry<br>_- Positive even integers result in closed shapes, but are not required._<br>_- When randomized, m will be rounded up to nearest even integer._  | 1.0 - 20.0 |
| `n1`      | _float_   | Affects convexity/concavity of edges, resulting in 'bloated' or 'pinched' shapes | 0.01 - 40.0 |
| `n2`      | _float_   | Similar to n1 | 0.01 - 40.0 |
| `n3`      | _float_   | Similar to n2 | 0.01 - 40.0 |
| `iterations` | _int_  | Number of concentric drawings | 1 - 10 |
| `decay`   | _float_   | Amount of negative change to all parameters per iteration | 0.05 - 0.2 |
| `invert`  | _boolean_ | Invert colors | true \| false |

## Examples

| Status text | Interpreted parameters |
|---              |---                 |
| `@superformulabot [a:1.0 b:1.0 m:3.0 n1:10.0 n2:10.0 n3:10.0 iterations:3 decay:.3 invert:true]` | Exactly as provided |
| `@superformulabot [a:3.0 m:5 n2:3]` | All parameters not provided are randomized (except invert) |
| `@superformulabot []` or `@superformulabot [scwifty]` | All parameters are randomized (except invert) |

## Technologies used
* [Node.js](https://nodejs.org)
* [Twit](https://github.com/ttezel/twit)
* [Processing 3.3.6](https://processing.org/) via [CLI](https://github.com/processing/processing/wiki/Command-Line) - _not included in this repo for size reasons_
* [Amazon EC2](https://aws.amazon.com/ec2/)

## References
* [Daniel Shiffman's Programming A-Z course](http://shiffman.net/a2z/twitter-bots/)
* [Running Processing without a display wiki page](https://github.com/processing/processing/wiki/Running-without-a-Display)
* [Scott Spencer's Twitter Bot Playground guide](https://spences10.gitbooks.io/twitter-bot-playground/content/)
* [Paul Bourke's article on effects of superformula parameters](http://paulbourke.net/geometry/supershape/)