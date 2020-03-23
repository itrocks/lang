# it.rocks.lang
Le guide du programmeur

## Installation

- Installez **git** (https://git-scm.com/downloads / `apt install git`)
- Installez le transpilateur it.rocks, depuis la ligne de commande Linux / Windows :

```bash
git clone https://github.com/itrocks/lang itrocks
```

- Installez **node.js** version 12 ou supérieure (https://nodejs.org/).
- Utilisez le transpilateur (Linux) :

```bash
# transpiler :
./itr examples/hello-world.itr
# exécuter :
examples/hello-world
```

- Ou utilisez le transpilateur (Windows) :

```batch
# transpiler :
itr examples\hello-world.itr
# exécuter :
examples\hello-world
```

- Créez vos programmes, transpilez, exécutez.

## Hello World !
```itr
print 'Hello, World !'
```

Résultat :
```Hello, World !```

## Syntaxe du langage it.rocks

- **Instruction :** Le code source de votre programme est composé d'instructions, qui constituent les ordres données à
  l'ordinateur. `print 'Hello, World !'` est une instruction.

- **Mots-clés :** Une instruction est elle-même constituée d'une suite de mots-clés. `print` et `'Hello, World !'` sont
  des mots-clés. Le premier représente une variable nommée `print` définie par le langage comme étant une fonction. Le
  second est une constante texte `'Hello, World !'`.

- **Séparateur d'instructions :** Les instructions sont séparées par un retour à la ligne, lorsque l'instruction
  suivante est indentée à un niveau inférieur ou égal à l'indention de l'instruction précédente. Voici une suite de deux
  instructions :
  ```itr
  print 'Hello, World !'
  print 'How beautiful you are.'
  ```
  Résultat :
  ```
  Hello, World !
  How beautiful you are.
  ```
  Ici, nous avons toujours deux instructions, le retour à la ligne suivi d'une indentation descendante indiquant au
  transpilateur que chaque instruction se poursuit :
  ```itr
  print 'Hello,'
    'World'
    '!'
  print 'How' 'beautiful'
    'you' 'are.'
  ```
  Le résultat est le même (notez que la fonction `print` sépare les différents affichages par un espace) :
  ```
  Hello, World !
  How beautiful you are.
  ```

- **Indentation :** L'indentation permet de présenter le code de manière hiérarchique. Dès que vous descendez d'un
  niveau d'indentation, vous indiquez au lecteur, que ce soit un humain qui lit votre code ou l'ordinateur qui va
  l'exécuter, que la suite du programme est subordonnée à votre première ligne de niveau plus élevé. L'indentation est
  donc un élément clé du langage, et doit impérativement être respectée.

## Variables

Les variables sont utilisées pour stocker des données, le résultat de vos calculs, des fonctions, des objets.

### Définir une variable
```itr
nom: 'Baptiste Pillot'
```
La variable nommée **nom** contient maintenant une chaîne de caractères dont le contenu est **Baptiste Pillot**.

### Nommage des variables
```itr
Une phrase peut être un nom de variable: 'Son contenu'
Un nombre négatif: -118
Un nombre à virgule (matérialisée par un point): 36.22
1th: 1
2nd: 2
```

Restrictions :
- Votre nom de variable ne peut pas contenir les caractères `;` (séparateur d'instructions),
  `:` (opérateur de définition de variable).
- Il ne peut pas être un numérique strict comme par exemple `128` : cette notation est réservée aux constantes
  numériques.
- Il ne peut pas commencer par un guillemet simple `'` ou double `"` : cette notation est réservée aux constantes texte.
- Mis à part ces restrictions, le nom de variable est totalement libre.
  Gardez à l'esprit que quand vous y faites référence, vous devez l'écrire très exactement de la même façon que vous
  l'avez définie, notamment pour ce qui est des minuscules, espaces, ponctuations, accents, etc.
  Mieux vaut utiliser des noms clairs mais simples et concis.
- Vous pouvez avoir un retour à la ligne dans votre nom de variable. Il sera remplacé, ainsi que les espaces et
  tabulations suivantes, par un unique espace. Exemple (notez l'indentation nécessaire) :
  ```itr
  Un nom de variable
    avec des retours
    à la ligne: 25
  ```
  équivaut très exactement à :
  ```itr
  Un nom de variable avec des retours à la ligne: 25
  ```

### Utiliser une variable
```itr
nom: 'Baptiste Pillot'
print nom
```
Résultat : `Baptiste Pillot`

La variable **nom** est définie comme une chaîne de caractères dont le contenu est **Baptiste Pillot**.  
Le contenu de la variable est ensuite affiché.

## Structures

### Conditions
```itr
condition: 1
if condition then
  print 'condition ok'
else
  print 'condition not ok'
```
Résultat : `condition ok`

- **condition** contient l'instruction dont le résultat est testé, ici le contenu de la variable `condition`.
  Sa valeur `1` est considérée comme une condition vérifiée. Les conditions non vérifiées doivent équivaloir à quelque
  chose de vide : `false`, `''`, `0`, `null` par exemple.
- L'instruction ou le bloc d'instructions après **then** est exécuté si la condition est remplie.
- L'instruction ou le bloc d'instructions après **else**, optionnel, est exécuté si la condition n'est pas remplie.

### Boucle while .. do
```itr
condition: 5
while condition do
  print condition
  condition = condition - 1
```
Résultat :
```
5
4
3
2
1
```

- **condition** contient l'instruction dont le résultat est testé à chaque itération de boucle, ici le contenu de la
  variable `condition`. Sa valeur équivant à une condition vérifiée tant qu'elle ne tombe pas à `0`.
- L'instruction ou le bloc d'instructions après **do** est n'exécuté que tant que la condition est remplie.
- La boucle s'interrompt dès que la condition n'est plus remplie, au début du bloc d'instructions.

### Boucle do .. while
```itr
condition: 5
do
  print condition
  condition = condition - 1
while condition
```
Résultat :
```
5
4
3
2
1
```

Contrairement à la notation `while .. do`, cette variante de boucle ne réalise le test de la **condition** qu'après
avoir exécuté une première fois le bloc d'instruction qui en dépend.

### Portée des variables
```itr
a: 1
b: 2
print a b
if a then
  a: 'A'
  print a b
  c: 3
  print a c
print a
print b
print c
```
Résultat :
```
1 2
A 2
A 3
1
2
ReferenceError: c is not defined
```

- Une variable n'est visible et utilisable par le programme qu'au niveau d'indentation où elle est définie, et aux
  niveaux d'indentation inférieurs. La variable est oubliée lorsque le programme remonte au niveau d'indentation
  supérieur.
- Dans l'exemple : les variables `a` et `b` définies sont visibles dans leur niveau d'indentation.
- Une nouvelle variable `a` est re-définie dans le bloc d'instructions du `if` : elle masque le `a` de niveau
  d'indentation supérieur, sans l'écraser. Le deuxième `print` va donc afficher sa valeur. `b` par contre n'est pas
  re-défini, et est utilisable car sur le niveau d'indentation supérieur.
- La variable `c` n'est visible que dans le bloc d'instructions du `if`, car définie localement. Elle est bien visible
  pour le troisième `print`. 
- Lors de la sortie du bloc d'instruction `if`, la variable `a` définie dans ce bloc est oubliée. Le quatrième `print`
  affiche donc la valeur du `a` qui avait été défini à ce niveau, hors du `if`.
- `b` est également toujours visible et inchangé.
- `c` n'existe par contre pas en dehors du bloc d'instructions du `if` : le dernier `print` provoque donc une erreur
  de transpilation et à l'exécution.
