import React, { useState } from 'react';
import { FileText, Book, HelpCircle, Layers, Check } from 'lucide-react';

const StudySyncAI = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
    setError(null);
  };

  const generateMaterials = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('/generate-materials', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setStudyMaterials(null);
      } else {
        setStudyMaterials(data);
        // Reset quiz state when new materials are generated
        setQuizAnswers({});
        setQuizResults({});
      }
    } catch (err) {
      setError(err.toString());
      setStudyMaterials(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuizAnswer = (quizIndex, optionIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizIndex]: optionIndex
    }));
  };

  const submitQuiz = () => {
    const newResults = {};
    studyMaterials.quizQuestions.forEach((quiz, index) => {
      newResults[index] = quizAnswers[index] === quiz.correctAnswer;
    });
    setQuizResults(newResults);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600 flex items-center justify-center">
          <Book className="mr-3" /> StudySync AI
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label 
            htmlFor="file-upload" 
            className="block w-full p-4 text-center border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 transition"
          >
            <input 
              type="file" 
              id="file-upload"
              accept=".txt,.md,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-center text-blue-600">
              <FileText className="mr-2" />
              {uploadedFile 
                ? `Uploaded: ${uploadedFile.name}` 
                : "Upload Text File for Study Materials"}
            </div>
          </label>
        </div>

        <button 
          onClick={generateMaterials}
          disabled={!uploadedFile || isProcessing}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Generate Study Materials"}
        </button>

        {studyMaterials && (
          <div className="mt-8 space-y-6">
            {/* Summary Section */}
            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <HelpCircle className="mr-2 text-blue-600" /> Summary
              </h2>
              <p className="text-gray-800">{studyMaterials.summary}</p>
            </section>

            {/* Quiz Questions */}
            <section className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Layers className="mr-2 text-green-600" /> Practice Quiz
              </h2>
              {studyMaterials.quizQuestions.map((quiz, index) => (
                <div key={index} className="mb-4">
                  <p className="font-medium mb-2 text-gray-800">{quiz.question}</p>
                  {quiz.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center mb-1">
                      <input 
                        type="radio" 
                        name={`quiz-${index}`} 
                        id={`quiz-${index}-option-${optIndex}`}
                        checked={quizAnswers[index] === optIndex}
                        onChange={() => handleQuizAnswer(index, optIndex)}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={`quiz-${index}-option-${optIndex}`}
                        className={`
                          ${quizResults[index] !== undefined 
                            ? (quizResults[index] && quizAnswers[index] === optIndex 
                              ? 'text-green-600' 
                              : (!quizResults[index] && quizAnswers[index] === optIndex 
                                ? 'text-red-600' 
                                : quiz.correctAnswer === optIndex 
                                  ? 'text-green-800' 
                                  : 'text-gray-800'))
                            : 'text-gray-800'
                          }
                        `}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                  {quizResults[index] !== undefined && (
                    <p className={`mt-1 ${quizResults[index] ? 'text-green-600' : 'text-red-600'}`}>
                      {quizResults[index] ? 'Correct!' : 'Incorrect'}
                    </p>
                  )}
                </div>
              ))}
              <button 
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length !== studyMaterials.quizQuestions.length}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                <Check className="mr-2" /> Submit Quiz
              </button>
            </section>

            {/* Flashcards */}
            <section className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Book className="mr-2 text-purple-600" /> Flashcards
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {studyMaterials.flashcards.map((card, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-4 rounded-lg shadow-md border border-purple-100"
                  >
                    <h3 className="font-bold text-purple-600 mb-2">{card.term}</h3>
                    <p className="text-gray-800">{card.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySyncAI;