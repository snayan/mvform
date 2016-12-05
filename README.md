# mvform

 JavaScript form validation ,which is lightweight and easy.
 
## Introduction

Rencently I need a form validation in some program having the same validate rules and style.I find [parsley](http://parsleyjs.org/),which can validate the form data with same rules ,but it have different error styles and so complex.So,I decided to write a myself form validation to do with these program.

## Requirements
* [jquery](https://github.com/jquery/jquery)>=1.8 
* [mvevent](https://github.com/snayan/mvevent)>=1.0.1

## Usage
using npm 

`npm install mvform --save` 

or using bower 

`bower install mvform --save`

## Example
More examlpes to see `/examples` directory,which include four way to use `mvform`.

* [base form validation](https://github.com/snayan/mvform/blob/master/examples/01_base.html)
* [define your own error message](https://github.com/snayan/mvform/blob/master/examples/02_your-msg.html)
* [define your own error container element](https://github.com/snayan/mvform/blob/master/examples/03_your-error-container.html)
* [ single element validaton](https://github.com/snayan/mvform/blob/master/examples/04_validate-an-input.html)

## Other
I use the [bootstrap](http://getbootstrap.com/) as css framwork.The form is horizontal,the error message will append to the label.So,[bootstrap](http://getbootstrap.com/) is the best choice to use with `myform`.You can use `mvform` just as form validation ,then writing your own css style based on the `mvform` css style.

## Contributing
I welcome contributions of all kinds from anyone.

* [Bug reports](https://github.com/snayan/mvform/issues)
* [Feature requests](https://github.com/snayan/mvform/issues)
* [Pull requests](https://github.com/snayan/mvform/pulls)

## License
Licensed under the MIT License