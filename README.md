# it.rocks.lang
The it.rocks language
Copyright (c) 2020 Baptiste Pillot

# Pre-requisites

- Install node.js® version 12+ : it is needed for both transpile or run your program.
- The node executable must be accessible from your command line PATH variable.

# Run unit tests

Check if your version if the it.rocks language transpiler is sane :

Linux :
```bash
./itr test
```

Windows :
```batch
itr test
```

Unit test files are into the **tests** directory :
you can study them to get code examples,
and learn how it is transpiled into javascript.
- tst files can be opened into any text editor
- Each file is divided into 3 sections :
  - The first section is the it.rocks code
  - The second section is the awaited transpiled javascript code
  - The third section is the awaited output when executed  

# Transpile

From your node installation directory, containing the current README file and launcher scripts.

Linux :
```bash
./itr examples/hello-world.itr
```

Windows :
```batch
itr examples\hello-world.itr
```

The transpiler generates 3 files :
- the transpiled code, eg **examples/hello-world.itr.js**
- a Linux executable launcher, eg **examples/hello-world**
- a Windows executable launcher, eg **examples\hello-world.bat**

With these files, you can execute the final executable into any Linux or Windows system that embeds
a recent version (12+) of node.js®

# Run transpiled program

Linux :
```bash
examples/hello-world
```

Windows :
```batch
examples\hello-world
```
