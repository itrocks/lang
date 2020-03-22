# it.rocks.lang - Transpilateur
Documentation interne

## Définitions

Définitions des termes employés dans cette documentation.
Correspondance avec la terminologie logicielle - nom de classe ou de variable du transpilateur -.

### Colonne
```
Column
```

Le numéro de colonne correspond au numéro de colonne dans le code source, lisible par un humain.
Il débute à 1, et s'incrémente au fur et à mesure de la lecture du code source par le transpilateur.

### Constante
```
Constant
```

Chaîne de caractères :
- Un mot-clé est une constante chaîne de caractères s'il commence par un guillemet simple `'` ou double `"`.
Il doit se terminer par le même caractère guillemet.
- Les retours à la ligne sont autorisés dans la chaîne de caractères.
- L'identation n'est pas impactée dans une chaîne de caractères.

Numérique :
- Un mot-clé est une constante numérique si elle est purement numérique et ne débute pas par un zéro.

### définition
```
:
```

Les variables du programme doivent être définies avant de pouvoir être utilisées.
Pour définir une variable, la première occurrence de son identifiant dans le code source doit précéder le délimiteur
de définition `:`.

Exemples :
```
var: 'value'
numeric: 18.44
A crazy name with spaces, "quotes", \backquotes\, 'almost anyhing: 'value' 
```

Sa définition suit les `:`, sous forme d'une chaîne de mots-clés :
- actuellement : une constante,
- à venir : un bloc de définition plus complexe : type, annotations, code, etc.

### Espace
```
Space
```

Sont cités comme "espaces" tous caractères d'espacement invisibles à l'oeil : espace, tabulation,
retour chariot (`CR`), saut de ligne (`LF`).

### Fonction
```
function
```

Une variable définissant une portion de code (`code`) et déclarant des arguments (`args`). 

### Identifiant
```
name
```

Le nom identifiant une variable.

### Instruction
```
Instruction
```

Un ordre donné à l'ordinateur, ou partie pour des ordres structurés (`Structure`).
Une instruction est constituée d'une chaîne (`chain`) de mots-clés (`keyword`)

### Mot-clé
```
Keyword
```

Dénomination générique regroupant constantes numériques ou textes, et variables.  

### Structure
```
Structure
```

Une structure définit un ordre plus complexe, structurant.
Par exemple une condition, une boucle, une définition de fonction.
Les structures sont constituées de plusieurs instructions structurantes.
Par exemple une condition est constituée de la condition elle-même (`if`),
du délimiteur de bloc d'instructions à exécuter si la condition est remplie (`then`),
du délimiteur de bloc d'instructions à exécuter si la condition n'est pas remplie (`else`),
puis du délimiteur de fin de structure (`stop`). 

### Variable
```
Variable
```

Un mot-clé est une variable s'il n'a pas été détecté chaîne de caractère ou numérique,
et si son identifiant correspond à une variable déclarée.

## Variables

Description de toutes les variables utilisées par l'algorithme du transpilateur.

### args
```
args: string[]
```

Description des arguments attendus par une fonction.

- Si non défini, un nombre et un typage libre d'arguments est attendu.
- Si tableau vide, la fonction n'attend aucun argument.

Définition :
- Dans une description de variable de type fonction (`code`).

Utilisation :
- Si aucun argument n'est défini, la chaîne (`chain`) est considérée close et traitée immédiatement (`break_chain`).

Utilisation future :
- Permettra de définir la liste d'arguments attendus, pour gérer le polymorphisme
  (plusieurs définitions pour le même nom de mot-clé / variable).

### break_chain
```
break_chain: boolean
```

Indique que la chaîne (`chain`) est considérée close.

- La décision est prise dès le mot-clé (`keyword`) délimité : s'il correspond à une fonction sans arguments (`args = []`).
- La rupture de chaîne intervient une fois passés les espaces, à la toute fin de la boucle d'élaboration de chaîne.

### breaks
```
Variable.breaks: boolean 
```

Indique que le mot-clé (`keyword`) variable clôture la chaîne (`chain`) de mots-clés en cours de constitution.

Définition :
- `breaks` est une propriété d'une variable.

Utilisation :
- Dès que que le mot-clé (`keyword`) est délimité par `breaks`, la chaîne courante est transpilée (`chain`).
- La chaîne courante est ensuite réinitialisée pour constitution de l'instruction suivante.

### chain
```
chain: Keyword[]
```

Chaîne de mots-clés (`keyword`) constituant une instruction.

Chaque mot-clé peut être :
- une constante texte,
- une constante numérique,
- une variable,
- une fonction.

Définition :
- La boucle principale du transpilateur consiste à délimiter les chaînes de mots-clés.
- Une chaîne est constituée de plusieurs mots-clés.
- Elle s'interrompt :
  - si un caractère séparateur d'instructions `;` est identifié (TODO non testé),
  - si un retour à la ligne est suivie d'une indentation inférieure ou égale à l'indentation de la chaîne de mots-clés
    précédente,
  - dès qu'un mot-clé variable définissant `break` est identifié,
  - dès qu'un mot-clé fonction sans argument (`args`) est identifié,
  - si la fin du fichier source (`source`) est atteinte. 

Utilisation :
- Dès la chaîne identifiée et clôturée, elle est traitée par la fonction `chain` du transpilateur,
  qui la transforme en code source destination en javascript en fonction des mots-clés qui la composent.

### chain_column
```
File.chain_column: integer
```

Colonne, dans le code source, où la chaîne de mots-clés (`chain`) a débuté.
Cette position donne une information clé sur le niveau d'indentation de l'instruction courante.

Définition :
- Le niveau d'indentation initial, au début du code source, est de 1.
- Après la transpilation d'une chaîne de mots-clés, le niveau est recalculé en fonction de l'emplacement courant,
  pour application à l'instruction suivante.
- En cas de retour à la ligne, cette colonne est calculée après retours à la lignes et espaces.

Utilisation :
- Avant la transpilation de la chaîne de mots-clés (`chain`),
  le niveau d'indentation `chain_indent` - débutant à 0 au lieu de 1 - est calculé.
- Voir `chain_indent`

### chain_indent
```
chain_indent: integer
```

Niveau d'indentation de la chaîne d'exécution (`chain`) à transpiler.

Définition :
- Calculé juste avant la transpilation `= chain_column - 1`.

Utilisation :
- Permet de calculer le code d'arrêt (`stop`) des blocs d'indentation de niveau supérieur au niveau d'indentation de
  l'instruction à transpiler.
- Permet également la libération des variables locales (`locals`) du contexte d'appel : toutes les variables définies
  dans le bloc sont supprimées, et ne seront plus visibles dans le bloc appelant.
- Si le premier mot-clé de l'instruction à transpiler n'est pas une sous-variable de la variable qui a ouvert le bloc,
  la désindentation est actée : le code d'arrêt est généré, et les variables locales sont également libérées.

Voir aussi :
- `dest`
- `indents`
- `vars`

### char
```
char: char
```

Le dernier caractère lu du code source it.rocks à transpiler (`source`) :

- correspond au caractère qui vient d'être lu dans le code source.
  Tous les caractères du code source sont étudiés, l'un après l'autre.
- dans `normalize` : le caractère du mot-clé, pour décider si la normalisation est nécessaire ou non.

### code
```
code: function
```
Code généré par le transpilateur, en javascript.

- Fonction : la fonction prend en entrée la chaîne d'arguments (`chain`).
- Constante numérique / texte : le code sera inséré tel quel.

### column
```
column: integer
```

Colonne donnant la position du dernier caractère (`char`) lu dans le code source (`source`).

Définition :
- Initialisé à 1 au début du code source.
- A chaque avancée dans le code source, le numéro de colonne est incrémenté.
- Après chaque retour à la ligne, positionné au niveau d'indentation courant (après les espaces).

Utilisation :
- La colonne de début de mot-clé (`keyword_column`) est mémorisée avant chaque délimitation de mot-clé (`keyword`).
- La colonne de début d'instruction / chaîne de mots-clés (`chain_column`) est mémorisée après chaque
  instruction transpilée (`chain`).
- Permet de calculer le niveau d'indentation de la prochaine instruction (`next_indent = column - 1`).
 
 Voir aussi :
 - `line`

### dest
```
File.dest: string
```

Code destination, généré au fur et à mesure de la transpilation des instructions.

Définition :
- Initialisé à '' au début de la lecture du code source.
- Le code transpilé s'y ajoute à chaque instruction exécutée (`chain`), mot-clé après mot-clé :
  - soit calculé par exécution du `code`, dans le cas d'une fonction,
  - soit ajoutée en brut, dans le cas d'une constante.
- Lors de la détection de la désindentation, le code d'arrêt du bloc courant (`stop`) est généré.
- Les définitions de variables s'y ajoutent à chaque détection de caractère de définition  `:`.

Utilisation :
- Ecrit dans le fichier javascript compilé à la fin de la transpilation. 

### dest_file
```
dest_file: string
```

Chemin du fichier où sera enregistré le code transpilé en javascript.

Définition :
- Chemin du fichier source (`source_file`), auquel est ajouté ".js".

### element
```
element: Keyword
```

Un élément d'une chaîne de mots-clés (`chain`).
Equivalent de `keyword`, dans un contexte de décodage de la chaîne de mots-clés.
Voir `keyword`.

### File
```
File:
  constructor: function
  chain: function
  normalize: function
  transpile: function
```

### file
```
Transpiler.file: function
```

Cette fonction transpile un fichier source it.rocks, et génère un fichier transpilé en javascript en sortie.

### files
```
Transpiler.files: function
```

Cette fonction transpile une liste de fichiers sources it.rocks, et génère les fichiers transpilés en javascript.

### globals
```
globals: Variable[]
```

Cette structure continent la liste des variables globales : constantes, variables ou fonctions.
Chacune est identifiée par son identifiant / nom.

Définition :
- Dans le fichier `globals.js`.

Utilisation :
- Sert de prototype initial à `locals` : les variables globales sont accessibles depuis tout le logiciel.
- Voir `locals`.

### indent
```
File.indent: integer
```

Stocke le niveau d'indentation de l'instruction courante du code source lu (`source`).

Définition :
- Initialisé à 0 au début de l'analyse du code source.
- Prend la valeur du niveau d'indentation suivant (`next_indent`) en fin d'analyse de chaîne de mots-clés (`chain`).

Utilisation :
- Détecter les désindentations, en comparant le niveau d'indentation actuel avec le dernier niveau
  d'indentation arrêté, pour stopper la délimitation de la chaîne de mots-clés courante (`chain`).
- Mémoriser si l'espace de stockage des variables normalisées (`normalized_init`) a déjà été initialisé au niveau
  d'indentation courant.
- Connaître le niveau d'indentation actuel, pour le stockage des éléments à exécuter au moment de la désindentation
  (`indents`) : code à générer à la sortie de bloc (`stop`), variables éléménents de structure (`vars`), variables de
  portée locale (`locals`).
- Acter les sur-indentations et désindentations, pour calculer le niveau d'indentation suivant (voir définition).

### indents
```
File.indents: Indent[]
```

Contient pour chaque niveau d'indentation atteint les éléments utiles à la désindentation, en sortie de bloc.

Définition :
- Tableau initialement vide. Indicé par le niveau d'indentation.
- Dès qu'un mot-clé variable (`keyword`) est identifié, les éléments utiles correspondants sont stockés pour le niveau
  d'indentation courant. Voir `locals`, `stop`, `var`.

Utilisation :
- Avant de transpiler l'instruction courante (`chain`), si une désindentation est détectée (`chain_indent`) :
  - Le code d'arrêt (`stop`) des blocs d'indentation de niveau supérieur au niveau d'indentation de l'instruction
    à transpiler est transpilé.
  - Les variables locales (`locals`) du contexte d'appel sont libérées : toutes les variables définies dans le bloc
    sont supprimées, et ne seront plus visibles dans le bloc appelant.
  - Si le premier mot-clé de l'instruction à transpiler n'est pas une sous-variable de la variable qui a ouvert le bloc,
    la désindentation est actée : le code d'arrêt est généré, et les variables locales sont également libérées.

Voir aussi :
- `chain_indent`

### index
```
index: integer
```

Position du dernier caractère lu dans le code source (`source`).

Définition :
- Initialisé à 0, pointant sur le premier caractère du code source.
- Incrémenté au fur et à mesure du parcours du code source.

Utilisation :
- Récupérer le caractère du code source pour analyse, construction des mots-clés et instructions. 
- Savoir si on est arrivé au bout du code source.
- Calculer l'indentation, par soustraction `index - index_save`.

### index_save
```
index_save: integer
```

Sauvegarde de la position (`index`) du caractère lu (`char`) dans le code source (`source`).
La valeur correspond à la position du dernier début de ligne, juste après un saut de ligne (`LF`).
Elle permet de calculer le niveau d'indentation actuel (`indent`) ou suivant (`next_indent`),
par soustraction `index - index_save`, lorsque `index` est positionné sur le début du premier mot-clé (`keyword`)
après les espaces d'indentation.

### inside
```
File.chain.inside: boolean|string
``` 

Indique si l'instruction est appelée à l'intérieur d'une autre instruction, pendant le transpilage du code (`string`),
ou est une instruction suivante (`false`).

Utilisation :
- Cette valeur détermine si le séparateur sera celui par défaut `\n`, ou un séparateur librement défini par le `code`.

### Keyword
```
Keyword:
  locals: Variable[][]
  name:   string
  stop:   function|string
  vars:   string[]
```

### keyword
```
keyword: Keyword
```

Mot-clé, constituant de base du programme.
Un mot-clé peut être une constante, une variable, une fonction.
Dans le cas d'une variable ou une fonction identifiés, le mot-clé est remplacé par un objet `Variable`.

Définition :
- Construit comme constante lors de l'identifcation d'un caractère de début de mot-clé guillemet simple `'`
  ou double `"`.
- Construit comme référence à une variable pour toute autre chaîne de caractères.
- Au terme de la construction du mot-clé, s'il correspond à un numérique pur (au sens isNaN javascript),
  sera une constante numérique.

Utilisation :
- Le caractère de définition `:` clôt le mot clé, qui est alors enregistré dans les variables locales (`locals`).
- Si identifié comme variable, `normalize` est appelé pour normaliser des variables dont le format ne serait pas
  accepté en javascript.
- Si identifié comme variable, un contrôle d'existence dans l'espace de variables accessibles (`locals`) est réalisé.
  En cas d'identifiant inconnu, le transpilateur continuera son exécution mais un code invalide sera généré, et une
  erreur de transpilation *! Unknown keyword* sera envoyée en sortie d'exécution erreurs.
- Les mots-clés, variables ou constantes, sont empilés (push) dans la chaîne de mots-clés (`chain`) constituant
  l'instruction en cours de transpilation. Pendant ce processus, les variables sont remplacés par l'objet variable pris
  dans les variables visibles (`locals`).

### keyword_column
```
keyword_column: integer
```

Numéro de colonne, dans le code source (`source`), où le mot-clé en cours de transpilage commence.
Les numéros de colonnes (`column`) commencent à 1.

Définition :
- Initialisé à 1 au début du transpilage du code source.
- Mémorisé au début de l'identification d'un mot clé, après l'indentation / les espaces.

Utilisation :
- Utilisé pour donner des informations de débuggage au développeur, en cas d'erreur,
  en plus du numéro de ligne (`keyword_line`).

### keyword_line
```
keyword_line: integer
```

Numéro de ligne, dans le code source (`source`), où le mot-clé en cours de transpilage commence.
Les numéros de lignes (`line`) commencent à 1.

Définition :
- Initialisé à 1 au début du transpilage du code source.
- Mémorisé au début de l'identification d'un mot clé.

Utilisation :
- Utilisé pour donner des informations de débuggage au développeur, en cas d'erreur,
  en plus du numéro de colonne (`keyword_column`).

### length
```
length: integer
```

Nombre de caractères dans le code source it.rocks (`source`).

Définition :
- Au début du transpilage, copie de `File.source.length`.

Utilisation :

- Permet de stopper le transpilage quand arrive la fin du code source :
  - à chaque identification de chaîne de mots-clés (`chain`),
  - après chaque ajout de caractère issu du code source au mot-clé (`keyword`), constante chaîne ou variable,
  - après la lecture des espaces en fin de chaîne de mots-clés.

  La dernière chaîne extraite du code source est transpilée avant l'enregistrement du code transpilé.

### line
```
line: integer 
```

Numéro de ligne position du dernier caractère (`char`) lu dans le code source (`source`).

Définition :
- Initialisé à 1 au début du code source.
- A chaque retour à la ligne (`LF`) dans le code source, le numéro de ligne est incrémenté.

Utilisation :
- La ligne de début de mot-clé (`keyword_line`) est mémorisée avant chaque délimitation de mot-clé (`keyword`).

Voir aussi :
- `column`

### locals
```
File.locals: Variable[]
```

Contient l'ensemble de variables définies à l'état d'avancement actuel de la transpilation.

Définition :
- Initialisé comme objet vide, dont le prototype est `globals`, au début du transpilage.
- En cas d'indentation, un espace de variables locales est créé, avec pour prototype l'espace de variables du niveau
  supérieur.
- En cas de désindentation, l'espace de variables locales est supprimé, et remplacé par l'espace de variables du niveau
  d'indentation correspondant au niveau d'indentation supérieur rétabli.

Utilisation :
- Dès qu'un mot-clé (`keyword`) variable est identifié, le transpilateur vérifie qu'il est bien défini dans les
  variables visibles localement. Un message **! Unknown keyword** est sorti par le transpilateur le cas échéant.

### name
```
Keyword.name: string
```

Identifiant d'une variable définie.

Définition :
- Initialisé dynamiquement au moment de l'identification des mots-clés (`keyword`)
  (pourrait l'être dans la définition des variables `Variable`).

Utilisation:
- Pour décider s'il faut désindenter ou non à l'arriver d'une instruction au même niveau qu'une instruction de
  structure, vérifie si la chaîne de mots-clés (`chain`) commence bien par une variable nommée.
- Ajouté à la liste des noms des sous-variables des instructions de structure (`vars`).

### next_indent
```
next_indent: integer
```

Définition :
- Initialisé à -1 avant l'identification de chaque chaîne de mots-clés (`chain`).
- A chaque changement d'indentation détecté par `index - index_save`, mémorisé pour application ultérieure.

Utilisation :
- En fin de traitement de la chaîne de mots-clés :
  - permet de détecter la désindantation et de mémoriser la nouvelle valeur de `indent`,
  - permet de détecter l'indentation et de mémoriser la nouvelle valeur de `indent`.

### normalize
```
File.normalize: function
```

Cette fonction transforme un identifiant de variable it.rocks en identifiant de variable javascript :
- Si l'identifiant de variable est compatible avec javascript, il est simplement préfixé d'un `$`,
- S'il comporte des caractères spéciaux incompatibles, il est prévixé par `$itr$['` et suffixé par `']`.

Identifier les identifiants de variables sous forme d'une chaîne caractères dans un tableau de hashage permet de donner
une liberté maximale de nommage des variables et fonctions : espaces, guillemets, backslashes, presque aucun caractère
n'est interdit.

Utilisation :
- normalized est appelé dès que le mot-clé est identifié comme étant un identifiant de variable, et pas une chaîne de
  caractères (débutant par `"` ou `'`) ou un numérique (`isNaN`).

### normalized
```
normalized: string
```

Stocke la version normalisée (`normalize`) d'un identifiant de variable.

Définition :
- Dès que le mot-clé est identifié comme étant un identifiant de variable.

Utilisation :
- Génération du code javascript de définition de variable.

### normalized_init
```
normalized_init: boolean[integer]
```

Mémorise si la variable réservée `$itr$` a déjà été initialisée dans le code destination (`dest`),
pour chaque niveau d'indentation.
- La clé est le niveau d'indentation à vérifier.
- La valeur est `true` si la variable a été initialisée. Sinon l'élément est indéfini (`undefined`).

### quote
```
quote: char
```

Le caractère qui a ouvert le mot-clé (`keyword`) constante chaîne de caractères.
- Si on mot clé débute par un guillemet `'` ou `"`, le mot clé sera une constante chaîne de caractères.
- Le transpilateur identifie la chaîne de caractère en cherchant le guillemet de fermeture.
- Seul le guillemet qui a servi à l'ouverture peut refermer la constante.
- Exception : un guillemet suit un caractère back-slash `\ ` ne clôture pas la constante.

### separator
```
File.chain.separator: string
```

Contient le séparateur d'instructions javascript générées.

Le choix du séparateur n'a qu'un but décoratif pour le code javascript généré. 

Définition :
- Le séparateur est initialisé à `\n`, sauf dans le cas du traîtement d'une chaîne de mots-clés (`chain`) depuis la
  transpilation d'une instruction (`code`), où aucun séparateur n'est requis.

Utilisation :
- Vient s'ajouter au code transpilé.

Voir aussi :
- `inside` 

### source
```
File.source: string
```

Code source it.rocks à transpiler.

Définition :
- Lu par le transpilateur avant le début de la transpilation (`transpile`).

Utilisation :
- Le code source est parcouru (`index`), caractère par caractère (`char`).

### source_file
```
File.source_file: string
```

Nom du fichier source it.rocks à transpiler.

Définition :
- Argument donné lors de l'appel au transpilateur en ligne de commande : `node path/file_name.itr`

Utilisation :
- Le contenu du fichier est lu, pour être stocké dans le code source (`source`) à transpiler.

### stop
```
Variable.stop: function|string
```

Déclare le code source qui marquera la fin d'un bloc structuré d'instructions (`chain`).

Définition :
- Dans la définition des variables globales (`globals`).

Utilisation :
- Avant la génération du code de la chaîne de mots-clés courante, le code constant (`string`) ou généré (`function`)
  est généré par le transpilateur pour la chaîne de mots-clés structure précédente, si les conditions d'indentation sont
  réunies (voir `chain_indent`, `vars`).

### transpile
```
File.transpile: function
```

Fonction de transpilation.
Transforme le code source it.rocks (`source`) en code transpilé javascript (`dest`).
Le code destination est immédiatement enregistré dans le fichier destination (`dest_file`).

### Transpiler
```
Transpiler:
  file: function
  files: function
```

Les instructions de base à la transpilation d'un (`file`) ou plusieurs (`files`) fichiers.

### Variable
```
Variable:
  args:   string[]
  breaks: boolean
  code:   function
  stop:   function|string
  vars:   Variable[]
```

La définition d'une variable globale.

Voir `args`, `breaks`, `code`, `stop`, `vars`.

### vars
```
Keyword.vars: Variable[]
```

Définition :
- Dans les variables globales (`globals`) de structure, déclare les sous-variables qui servent de délimiteurs à la
  structure. Exemple pour `if` : `then` et `else`. Exemple pour `while`: `do`. etc.
  
Utilisation :
- Les sous-variables constituent les variables locales (`locals`) dans le contexte d'une instruction.   
- La liste des sous-variables servent à initialiser les identifiants des variables de structure (`Keyword`)
  à n'analyser qu'une fois pour une structure.

```
Variable.vars: string[]
```

Liste des mots réservés qui sont des sous-variables de la structure courante.
- Lors de l'ajout du mot-clé (`keyword`) variable à la chaîne de mots-clés (`chain`),
  initialisé avec l'identifiant de la variable et la liste des sous-variables contextuelles de la structure
  (`Variable`).
- Dès qu'un des identifiants de variable est utilisé pour empêché la désindentation, il est supprimé du tableau pour
  n'être utilisé qu'une fois : les secondes utilisations débutent d'autres instructions, ou sont parties de la chaîne.
