import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import api from '../services/api';
import { colors, typography, spacing } from '../styles/theme';

export default function QuizScreen() {
  const { user } = useContext(UserContext);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadQuiz();
      loadAttempts();
    }
  }, [user]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.getQuizOptions();
      if (response.success && response.quiz) {
        setQuizData(response.quiz);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      const response = await api.getQuizAttempts(user.id);
      if (response.success && response.attempts) {
        setAttempts(response.attempts);
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData.questions.length;

    if (answeredCount < totalQuestions) {
      Alert.alert(
        'Incomplete Quiz',
        `You've answered ${answeredCount} out of ${totalQuestions} questions. Do you want to submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitQuiz },
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.submitQuiz(user.id, { responses: answers });
      if (response.success) {
        setSubmitted(true);
        Alert.alert('Success', 'Quiz submitted successfully! Your match scores will be updated.');
        loadAttempts();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  };

  if (loading && !quizData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  if (!quizData || !quizData.questions) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>Quiz not available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuiz}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.completedContainer}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Quiz Complete!</Text>
            <Text style={styles.completedText}>
              Your responses have been saved and your compatibility scores have been updated.
            </Text>

            {attempts.length > 0 && (
              <View style={styles.attemptsSection}>
                <Text style={styles.attemptsTitle}>Your Quiz History</Text>
                {attempts.slice(0, 3).map((attempt, index) => (
                  <View key={index} style={styles.attemptCard}>
                    <Text style={styles.attemptDate}>
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.attemptScore}>
                      {attempt.totalResponses} questions answered
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.retakeButton} onPress={resetQuiz}>
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </Text>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionCategory}>{question.category}</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = answers[question.id] === option.value;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => handleAnswer(question.id, option.value)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          {currentQuestion < quizData.questions.length - 1 ? (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Answer Summary */}
        <Text style={styles.answerSummary}>
          Answered: {Object.keys(answers).length} / {quizData.questions.length}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  questionCategory: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  questionText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  answerSummary: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  completedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  completedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  attemptsSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  attemptsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  attemptCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  attemptDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  attemptScore: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  retakeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retakeButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
