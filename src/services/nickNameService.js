const adjective = ['humble', 'hospitable', 'positive', 'romantic', 'generous', 'friendly', 'bold', 'virtuous', 'sweet', 'kindly', 'charming', 'cheerful', 'agile', 'lively', 'diligent', 'amiable', 'sociable', 'lovely', 'soft', 'sincere', 'honest', 'reliable', 'considerate', 'ambitious', 'polite', 'gentle', 'quiet', 'brave', 'talkative', 'shy', 'picky', 'persistent', 'adorable', 'alluring', 'elegant', 'handsome', 'wild', 'wise', 'witty', 'zany'];
const animal = ['gazelee', 'rhinoceros', 'elk', 'bear', 'panda', 'okapi', 'dolphin', 'leopard', 'ladybird', 'bee', 'dragonfly', 'cuckoo', 'flamingo', 'bat', 'tadpole', 'anaconda', 'orangutan', 'fly', 'elephant', 'puma', 'iguana', 'skunk', 'snail', 'moth', 'sloth', 'mole', 'hyena', 'crow', 'magpie', 'swan', 'gull', 'hawk', 'goat', 'pigeon', 'shark', 'donkey', 'ostrich', 'toad', 'fox', 'owl', 'parrot', 'penguin', 'deer', 'lizard', 'reindeer', 'squirrel', 'seal', 'otter', 'giraffe', 'cat', 'dog', 'horse', 'hamster', 'buffalo', 'camel', 'turtle', 'monkey', 'rabbit', 'koala', 'beaver'];

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}
class nickNameService {
  static nameIdx = 0;

  static createNickname() {
    let nickname = adjective[this.nameIdx % adjective.length] + " " + animal[this.nameIdx % animal.length];

    this.nameIdx++;
    if (this.nameIdx >= adjective.length * animal.length) {
      this.nameIdx = 0;
      shuffle(adjective);
      shuffle(animal);
    }

    return nickname;
  }
}

module.exports = { nickNameService };
