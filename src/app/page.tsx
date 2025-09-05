'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, CheckCircle, XCircle, Brain, Award, Users, MessageCircle, Play, Timer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

// Tipos para o quiz
type QuestionType = 'memory' | 'logic' | 'sequence' | 'visual'

interface Question {
  id: number
  type: QuestionType
  question: string
  options: string[]
  correctAnswer: number
  hint?: string
}

interface Testimonial {
  id: number
  name: string
  age: number
  text: string
  avatar: string
}

const questions: Question[] = [
  {
    id: 1,
    type: 'memory',
    question: "Qual destas palavras foi mostrada no início?",
    options: ["Cérebro", "Memória", "Neurônio", "Sinapse"],
    correctAnswer: 1,
    hint: "Lembre-se: está relacionada com armazenamento de informações"
  },
  {
    id: 2,
    type: 'logic',
    question: "Resolva: 7 + 8 - 3 = ?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    hint: "Faça a conta passo a passo: primeiro some, depois subtraia"
  },
  {
    id: 3,
    type: 'sequence',
    question: "Complete a sequência: 2, 4, 6, __, 10",
    options: ["7", "8", "9", "10"],
    correctAnswer: 1,
    hint: "Pense em números pares em ordem crescente"
  },
  {
    id: 4,
    type: 'visual',
    question: "Qual imagem aparece diferente das outras?",
    options: ["🟢", "🔵", "🟡", "🔴"],
    correctAnswer: 2,
    hint: "Observe as cores e formatos"
  },
  {
    id: 5,
    type: 'memory',
    question: "Quantas perguntas você já respondeu?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 2,
    hint: "Conte as perguntas anteriores"
  },
  {
    id: 6,
    type: 'logic',
    question: "Se todos os dias você pratica 15 minutos, quantas horas pratica em uma semana?",
    options: ["1 hora", "1.5 horas", "2 horas", "2.5 horas"],
    correctAnswer: 1,
    hint: "15 minutos × 7 dias = ?"
  },
  {
    id: 7,
    type: 'memory',
    question: "Lembre-se: Qual foi a primeira cor mencionada nas opções da pergunta 4?",
    options: ["Verde", "Azul", "Amarelo", "Vermelho"],
    correctAnswer: 0,
    hint: "Volte mentalmente à pergunta sobre imagens diferentes"
  },
  {
    id: 8,
    type: 'logic',
    question: "Se um trem viaja a 60 km/h, quanto tempo leva para percorrer 30 km?",
    options: ["15 minutos", "30 minutos", "45 minutos", "1 hora"],
    correctAnswer: 1,
    hint: "Tempo = Distância ÷ Velocidade"
  }
]

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    age: 62,
    text: "Depois de 3 meses usando o programa, minha memória melhorou muito! Consigo lembrar de nomes e datas com mais facilidade.",
    avatar: "https://i.postimg.cc/nrRq6CK8/499548560-122107819226872104-6326572501670952078-n.jpg"
  },
  {
    id: 2,
    name: "José Santos",
    age: 58,
    text: "Os exercícios são divertidos e eficazes. Sinto minha mente mais ágil e concentrada no trabalho.",
    avatar: "https://i.postimg.cc/BQRKHWMC/492962630-2305408356523369-1719661736900287702-n.jpg"
  },
  {
    id: 3,
    name: "Ana Costa",
    age: 67,
    text: "Meu médico notou a diferença! Meus testes cognitivos melhoraram significativamente.",
    avatar: "https://i.postimg.cc/YqDxPy84/75594412-666481110541873-5062177093631082496-n.jpg"
  }
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'result' | 'offer'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos em segundos
  const [stars, setStars] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(30) // 30 segundos por pergunta
  const [showConfetti, setShowConfetti] = useState(false)

  // Sons - usando o Audio API para sons simples
  const playSound = (type: 'click' | 'correct' | 'wrong' | 'champion') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          break
        case 'correct':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          break
        case 'wrong':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          break
        case 'champion':
          // Som de campeão - melodia ascendente triunfante
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // G5
          oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.6) // C6
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0)
          break
      }
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + (type === 'champion' ? 1.0 : 0.3))
    } catch (error) {
      console.log('Audio not supported:', error)
    }
  }

  // Efeito para o contador regressivo
  useEffect(() => {
    if (currentStep === 'intro' || currentStep === 'offer') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep])

  // Efeito para o timer das perguntas
  useEffect(() => {
    if (currentStep === 'quiz' && !isAnswered) {
      const timer = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // Tempo esgotado - considerar como resposta errada
            if (!isAnswered) {
              handleAnswer(-1) // -1 indica tempo esgotado
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, isAnswered, currentQuestion])

  // Resetar timer quando mudar de pergunta
  useEffect(() => {
    if (currentStep === 'quiz') {
      setQuestionTimer(30)
    }
  }, [currentQuestion, currentStep])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = () => {
    playSound('click')
    setCurrentStep('quiz')
    setCurrentQuestion(0)
    setScore(0)
    setStars(0)
  }

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return
    
    playSound('click')
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer
    
    if (isCorrect) {
      playSound('correct')
      setScore(prev => prev + 1)
      setStars(prev => prev + 1)
    } else if (answerIndex !== -1) { // -1 é tempo esgotado, não toca som de errado
      playSound('wrong')
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
        setShowHint(false)
      } else {
        // Final do quiz - tocar som de campeão e mostrar serpentinas
        playSound('champion')
        setShowConfetti(true)
        setTimeout(() => {
          setCurrentStep('result')
          setShowConfetti(false)
        }, 3000) // Mostrar serpentinas por 3 segundos
      }
    }, 2000)
  }

  const handleContinueToOffer = () => {
    playSound('click')
    setCurrentStep('offer')
  }

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100
  }

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) return "Excelente! Sua mente está muito afiada! 🌟"
    if (percentage >= 60) return "Muito bom! Você está no caminho certo! 🎯"
    if (percentage >= 40) return "Bom trabalho! Com prática você melhora! 💪"
    return "Ótimo começo! A prática leva à perfeição! 🚀"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        {/* Confetti/Serpentinas */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-8"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)]
                }}
                initial={{ y: -20, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: 360,
                  x: Math.random() * 200 - 100
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        )}

        {/* Contador regressivo para urgência */}
        {(currentStep === 'intro' || currentStep === 'offer') && (
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-full flex items-center gap-2 font-semibold">
              <Clock className="w-4 h-4" />
              Oferta especial termina em: {formatTime(timeLeft)}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <Brain className="w-20 h-20 mx-auto text-purple-600 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                  Você sabia que exercícios mentais simples podem melhorar sua memória e prevenir doenças como Alzheimer e demência? 💡
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  Participe do nosso quiz gratuito, treine sua mente agora e descubra como está a sua memória! 🧠✨
                </p>
              </div>

              <Button 
                onClick={handleStartQuiz}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl px-8 py-4 rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                size="lg"
              >
                Começar Quiz
              </Button>

              {/* Prova social */}
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="mr-3">
                          {testimonial.avatar.startsWith('http') ? (
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-3xl">{testimonial.avatar}</div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.age} anos</p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{testimonial.text}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Barra de progresso */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Pergunta {currentQuestion + 1} de {questions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round(getProgress())}%
                  </span>
                </div>
                <Progress value={getProgress()} className="h-3" />
              </div>

              {/* Timer da pergunta */}
              <div className="mb-6">
                <div className="flex justify-center items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  <div className="text-lg font-bold text-orange-600">
                    Tempo: {questionTimer}s
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      questionTimer > 10 ? 'bg-green-500' : 
                      questionTimer > 5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(questionTimer / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Estrelas conquistadas */}
              <div className="flex justify-center mb-6">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-200 dark:border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {questions[currentQuestion].question}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Escolha a resposta correta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === index ? "default" : "outline"}
                        className={`p-4 h-auto text-left justify-start text-lg ${
                          isAnswered && index === questions[currentQuestion].correctAnswer
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : isAnswered && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : ''
                        }`}
                        onClick={() => handleAnswer(index)}
                        disabled={isAnswered}
                      >
                        {option}
                        {isAnswered && index === questions[currentQuestion].correctAnswer && (
                          <CheckCircle className="ml-auto w-5 h-5" />
                        )}
                        {isAnswered && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                          <XCircle className="ml-auto w-5 h-5" />
                        )}
                      </Button>
                    ))}
                    
                    {/* Mensagem de tempo esgotado */}
                    {isAnswered && selectedAnswer === -1 && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                        <p className="text-red-700 font-semibold text-lg">
                          ⏰ Tempo esgotado!
                        </p>
                        <p className="text-red-600 text-sm">
                          A resposta correta era: {questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}
                        </p>
                      </div>
                    )}
                  </div>

                  {showHint && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Dica:</strong> {questions[currentQuestion].hint}
                      </p>
                    </div>
                  )}

                  {!showHint && isAnswered && selectedAnswer !== questions[currentQuestion].correctAnswer && selectedAnswer !== -1 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowHint(true)}
                      className="w-full"
                    >
                      Mostrar dica
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <Award className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Parabéns! Você já está exercitando sua mente! 🎉
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {getScoreMessage()}
                </p>
                <div className="text-3xl font-bold text-purple-600 mb-6">
                  Você acertou {score} de {questions.length} perguntas!
                </div>
              </div>

              <Button 
                onClick={handleContinueToOffer}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-8 py-4 rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                size="lg"
              >
                Ver minha oferta especial
              </Button>
            </motion.div>
          )}

          {currentStep === 'offer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Cabeçalho com VSL */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Receba hoje o seu resultado e o material exclusivo com técnicas e exercícios mentais
                </h2>
                <p className="text-xl text-gray-600">
                  Seu desempenho no teste mostra um grande potencial para melhoria!
                </p>
              </div>

              {/* Video Sales Letter */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-200 dark:border-gray-700">
                <CardContent className="p-8">
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe 
                      src="https://player.vimeo.com/video/1115923584?h=7b8e4b4e1e&title=0&byline=0&portrait=0" 
                      className="w-full h-full"
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados Comparativos */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-200 dark:border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Seus resultados de memória e foco
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Comparação entre antes e depois do programa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Imagem de Resultados */}
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src="https://media.inlead.cloud/uploads/22540/2025-08-10/lg-VwvJq-results-frame46d391f6.png" 
                        alt="Resultados do teste de memória e foco" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                  {/* Velocidade de Raciocínio */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-blue-600" />
                      Velocidade de Raciocínio
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-red-700 font-medium">Antes do Material</span>
                          <span className="text-red-600 font-bold text-xl">30%</span>
                        </div>
                        <p className="text-red-600 text-sm">Dificuldade, tempo demorado</p>
                        <div className="w-full bg-red-200 rounded-full h-3 mt-3">
                          <div className="bg-red-500 h-3 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-700 font-medium">Após o Material</span>
                          <span className="text-green-600 font-bold text-xl">90%</span>
                        </div>
                        <p className="text-green-600 text-sm">Respostas mais ágeis, facilidade</p>
                        <div className="w-full bg-green-200 rounded-full h-3 mt-3">
                          <div className="bg-green-500 h-3 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memória */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-600" />
                      Memória
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-red-700 font-medium">Antes do Material</span>
                          <span className="text-red-600 font-bold text-xl">45%</span>
                        </div>
                        <p className="text-red-600 text-sm">Esquecimento frequente, Dificuldade com lembrança</p>
                        <div className="w-full bg-red-200 rounded-full h-3 mt-3">
                          <div className="bg-red-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-700 font-medium">Após o Material</span>
                          <span className="text-green-600 font-bold text-xl">82%</span>
                        </div>
                        <p className="text-green-600 text-sm">Memória mais nítida e ágil. Facilidade com informações</p>
                        <div className="w-full bg-green-200 rounded-full h-3 mt-3">
                          <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Atenção e Concentração */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-600" />
                      Atenção e Concentração
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-red-700 font-medium">Antes do Material</span>
                          <span className="text-red-600 font-bold text-xl">37%</span>
                        </div>
                        <p className="text-red-600 text-sm">Dificuldade em manter a concentração</p>
                        <div className="w-full bg-red-200 rounded-full h-3 mt-3">
                          <div className="bg-red-500 h-3 rounded-full" style={{ width: '37%' }}></div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-700 font-medium">Após o Material</span>
                          <span className="text-green-600 font-bold text-xl">87%</span>
                        </div>
                        <p className="text-green-600 text-sm">Maior capacidade de manter o foco por períodos mais longos</p>
                        <div className="w-full bg-green-200 rounded-full h-3 mt-3">
                          <div className="bg-green-500 h-3 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saúde Mental e Bem-estar */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-green-600" />
                      Saúde Mental e Bem-estar
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-red-700 font-medium">Antes do Material</span>
                          <span className="text-red-600 font-bold text-xl">23%</span>
                        </div>
                        <p className="text-red-600 text-sm">Cansaço mental após atividades simples</p>
                        <div className="w-full bg-red-200 rounded-full h-3 mt-3">
                          <div className="bg-red-500 h-3 rounded-full" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-700 font-medium">Após o Material</span>
                          <span className="text-green-600 font-bold text-xl">92%</span>
                        </div>
                        <p className="text-green-600 text-sm">Sentimento de bem-estar mental, com mais clareza e motivação</p>
                        <div className="w-full bg-green-200 rounded-full h-3 mt-3">
                          <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Oferta Final */}
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-2">Pegue seu material e o resultado detalhado do teste aqui</h3>
                    <div className="text-xl mb-4">Oferta por tempo limitada!</div>
                    <div className="text-2xl font-bold text-yellow-300 mb-2">Oportunidade Única!</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                    <h4 className="text-xl font-semibold mb-4">Acesso completo inclui:</h4>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-300" />
                        <span>Teste completo com análise detalhada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-300" />
                        <span>Material exclusivo de exercícios mentais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-300" />
                        <span>Acompanhamento personalizado</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2">
                      <span className="line-through text-gray-300">R$ 47,90</span>
                      <span className="text-yellow-300 ml-4">20% OFF</span>
                    </div>
                    <div className="text-5xl font-bold text-yellow-300">
                      R$ 37,90
                    </div>
                    <div className="text-lg opacity-90">à vista</div>
                  </div>

                  <Button 
                    onClick={() => {
                      playSound('click')
                      // Redirecionar para a página de compra
                      window.open('https://flownetic-digital.mycartpanda.com/checkout/195590000:1', '_blank')
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 text-2xl px-12 py-6 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg w-full max-w-md mx-auto"
                    size="lg"
                  >
                    Quero meu acesso agora!
                  </Button>

                  <div className="mt-4 text-sm opacity-75">
                    ⚠️ Oferta válida apenas para os primeiros 100 participantes
                  </div>
                </CardContent>
              </Card>

              {/* Card de Destaques do Plano */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-200 dark:border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Destaques do seu plano
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Veja tudo que você vai receber:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Exercícios diários para melhorar a memória e concentração.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Treinamento mental interativo e divertido.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Acompanhamento de progresso para garantir resultados reais.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Facilidade de acesso: pratique de qualquer lugar, a qualquer hora.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Avaliação detalhada de suas habilidades de memória e foco.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Seu perfil cognitivo personalizado de pontos fortes e fracos.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Estratégias especializadas para aumentar a concentração, a energia mental e a recordação.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300">Garantia de devolução do dinheiro.</span>
                    </div>
                  </div>

                  {/* Seção de Garantia */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-green-200 dark:border-green-700">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <img 
                          src="https://media.inlead.cloud/uploads/22540/2025-08-06/md-bR7GP-chatgpt-image-6-de-ago-de-2025-22-45-59.png" 
                          alt="Garantia de 7 dias" 
                          className="w-32 h-32 rounded-lg object-cover shadow-md"
                        />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                          Garantia de 7 Dias
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          Acreditamos que o nosso plano pode funcionar para si e obterá resultados visíveis dentro de 4 semanas!
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 font-semibold">
                          Estamos até prontos para devolver o seu dinheiro se não vir resultados visíveis e puder demonstrar que seguiu o nosso plano.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Script de Pixel da UTMify */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.pixelId = "68ba0852f779549ccccca1e5";
          var a = document.createElement("script");
          a.setAttribute("async", "");
          a.setAttribute("defer", "");
          a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
          document.head.appendChild(a);
        `
      }} />
      
      {/* Script do Microsoft Clarity */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "t5zmwof9cn");
        `
      }} />
    </div>
  )
}