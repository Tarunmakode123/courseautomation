export interface UnitData {
  topics: string[];
}

export interface SubjectSyllabus {
  subject: string;
  fullSubjectName: string;
  subjectCode: string;
  units: Record<string, UnitData>;
}

export interface SyllabusDatabase {
  [className: string]: SubjectSyllabus;
}

export const SYLLABUS_DATA: SyllabusDatabase = {
  "AIML-1": {
    subject: "NLP",
    fullSubjectName: "Natural Language Processing",
    subjectCode: "AL 504 (B)",
    units: {
      "Unit 1": {
        topics: [
          "Origins and challenges of NLP",
          "Language Modeling: Grammar-based LM, Statistical LM",
          "Regular Expressions & Finite-State Automata",
          "English Morphology",
          "Transducers for lexicon and rules",
          "Tokenization",
          "Detecting and Correcting Spelling Errors",
          "Minimum Edit Distance"
        ]
      },
      "Unit 2": {
        topics: [
          "Unsmoothed N-grams & Evaluating N-grams",
          "Smoothing, Interpolation and Backoff",
          "Word Classes & Part-of-Speech Tagging",
          "Rule-based, Stochastic and Transformation-based Tagging",
          "Issues in PoS tagging",
          "Hidden Markov Models (HMM) & Maximum Entropy models",
          "Viterbi algorithm and EM training"
        ]
      },
      "Unit 3": {
        topics: [
          "Context-Free Grammars (CFG) & Grammar rules for English",
          "Treebanks & Normal Forms for grammar",
          "Dependency Grammar",
          "Syntactic Parsing & Ambiguity",
          "Dynamic Programming parsing & Shallow parsing",
          "Probabilistic CFG (PCFG) & Probabilistic CYK",
          "Probabilistic Lexicalized CFGs",
          "Feature structures & Unification of feature structures"
        ]
      },
      "Unit 4": {
        topics: [
          "Requirements for representation, First-Order Logic & Description Logics",
          "Syntax-Driven Semantic analysis & Semantic attachments",
          "Word Senses, Relations between Senses & Thematic Roles",
          "Selectional restrictions",
          "Word Sense Disambiguation (WSD): Supervised, Dictionary & Thesaurus, Bootstrapping",
          "Word Similarity using Thesaurus and Distributional methods",
          "Compositional semantics"
        ]
      },
      "Unit 5": {
        topics: [
          "Applications of NLP: Intelligent word processors",
          "Machine translation",
          "User interfaces & Man-Machine interfaces",
          "Natural language querying",
          "Tutoring and authoring systems",
          "Speech recognition",
          "Commercial use of NLP"
        ]
      }
    }
  },
  "AIML-2": {
    subject: "DL",
    fullSubjectName: "Deep Learning",
    subjectCode: "AL 503 (B)",
    units: {
      "Unit 1": {
        topics: [
          "Introduction & History of Deep Learning",
          "McCulloch Pitts Neuron",
          "Multilayer Perceptrons (MLPs) & Representation Power of MLPs",
          "Sigmoid Neurons",
          "Feed Forward Neural Networks & Backpropagation",
          "Weight initialization methods",
          "Batch Normalization",
          "Representation Learning",
          "GPU implementation",
          "Decomposition – PCA and SVD"
        ]
      },
      "Unit 2": {
        topics: [
          "Deep Feedforward Neural Networks",
          "Gradient Descent (GD), Momentum Based GD, Nesterov Accelerated GD",
          "Stochastic GD, AdaGrad, Adam, RMSProp",
          "Auto-encoder & Regularization in auto-encoders",
          "Denoising auto-encoders",
          "Sparse auto-encoders",
          "Contractive auto-encoders",
          "Variational auto-encoder (VAE)",
          "Auto-encoders relationship with PCA and SVD",
          "Dataset augmentation"
        ]
      },
      "Unit 3": {
        topics: [
          "Introduction to Convolutional Neural Networks (CNN) & Architectures",
          "CNN Terminologies: ReLU activation function, Stride, Padding, Pooling, Convolutions",
          "Convolutional kernels & Types of layers (Convolutional, Pooling, Fully Connected)",
          "Visualizing CNN",
          "CNN Architectures: LeNet, AlexNet, ZF-Net, VGGNet, GoogLeNet, ResNet, RCNN",
          "Deep Dream & Deep Art",
          "Regularization: Dropout, DropConnect, Unit Pruning, Stochastic Pooling, Noise Injection, Early Stopping, Weight Decay"
        ]
      },
      "Unit 4": {
        topics: [
          "Introduction to Deep Recurrent Neural Networks (RNN) & Architectures",
          "Backpropagation Through Time (BPTT) & Truncated BPTT",
          "Vanishing and Exploding Gradients",
          "Gated Recurrent Units (GRUs)",
          "Long Short-Term Memory (LSTM) & Solving Vanishing Gradient with LSTMs",
          "Encoding and Decoding in RNN network",
          "Attention Mechanism, Attention over images & Hierarchical Attention",
          "Directed Graphical Models",
          "Applications of Deep RNN in Image Processing, NLP, Speech Recognition, Video Analytics"
        ]
      },
      "Unit 5": {
        topics: [
          "Introduction to Deep Generative Models",
          "Restricted Boltzmann Machines (RBMs) & Gibbs Sampling",
          "Deep Belief Networks (DBN)",
          "Markov Networks & Markov Chains",
          "Auto-regressive Models: NADE, MADE, PixelRNN",
          "Generative Adversarial Networks (GANs)",
          "Applications of Deep Learning in Object Detection, Speech/Image Recognition, Video Analysis, NLP, Medical Science"
        ]
      }
    }
  }
};

export const TIMETABLE_DATA = {
  "AIML-1": {
    "NLP": {
      "type": "Lecture"
    }
  },
  "AIML-2": {
    "DL": {
      "type": "Lecture"
    }
  }
};
