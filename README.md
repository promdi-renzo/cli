<p align="center"><img src="https://github.com/mayajs/maya/blob/master/maya.svg"></p>

<h1 align="center">MayaJS CLI</h1>

The MayaJS CLI is a command line interface for MayaJS. Its primary purpose is to assist developers with building MayaJS projects. MayaJS CLI allows you to generate and serving MayaJS project as well as generate MayaJS files (e.g. controllers, services and models).

# Table of Contents

- [maya new](#new)
- [maya serve](#serve)
- [maya generate](#generate)

# Installation

In order to start using MayaJS CLI you need to install it globally.

> `npm install -g @mayajs/cli`

## NEW

> new|n <directory>

Create a new MayaJS project. This will generate all the basic files and install all the necessary dependencies for your MayaJS Project.

### Usage

`maya new my-new-app` or `maya n my-new-app`

## GENERATE

> generate|g <component> <directory>

This will help you generate components inside your MayaJS project. You can generate controllers, sevices and models using this command.

### Usage

#### CONTROLLER

`maya generate controller sample` or `maya g c sample`

#### SERVICE

`maya generate service sample` or `maya g s sample`

#### MODEL

`maya generate model sample` or `maya g m sample`

## SERVE

> serve|s [options]

This will run your MayaJS project which listens on port `3333` by default. In case where port `3333` is already in use or you want to run it on a different port number, use `--port` to specify a different port.

### Usage

#### DEFAULT

`maya serve` or `sh maya s`

#### CHANGE PORT

`maya serve --port 4444` or `maya s -p 4444`
