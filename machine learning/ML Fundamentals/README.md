# Machine Learning: Model Evaluation & Information Theory Playground

This repository serves as a deep-dive reference into the core concepts of evaluating machine learning models and understanding fundamental information theory concepts. It is intended to be a robust, long-term study guide, combining practical implementation with deep mathematical intuition.

---

## Table of Contents
1. [General Setup & Tools Notes](#1-general-setup--tools-notes)
2. [Data Splitting](#2-data-splitting)
3. [Cross-Validation Techniques](#3-cross-validation-techniques)
4. [Classification Evaluation Metrics](#4-classification-evaluation-metrics)
5. [Regression Evaluation Metrics](#5-regression-evaluation-metrics)
6. [Information Theory Concepts](#6-information-theory-concepts)

---

## 1. General Setup & Tools Notes

*(Note: These are preserved fundamental notes regarding `pandas` and `scikit-learn` datasets for reference.)*

### Scikit-Learn `iris` Dataset
The `irisdataset` is a standard dataset in `scikit-learn`. It contains 150 instances for classifying 3 types of flowers: Setosa, Versicolor, and Virginica. There is an equal distribution (50 instances of each class).
There are 4 features:
* Sepal length
* Sepal width
* Petal length
* Petal width

Loading iris (`load_iris()`) returns a class with the following properties:
* `data`: Containing values for the 4 features
* `target`: The resulting classes
* `target_names`: The string names of the classes
* `DESCR`: Full description of the dataset
* `feature_names`: String names of the 4 features
* `filename` and `data_module`

### Pandas Basics
* **Series**: In Pandas, a `Series` is like a single column holding a table of data. If nothing is specified, the labels will default to sequential indices.
  You can explicitly add an index:
  ```python
  import pandas as pd
  a = [1, 7, 2]
  myvar = pd.Series(a, index=["x", "y", "z"])
  print(myvar)
  # Output:
  # x    1
  # y    7
  # z    2
  # dtype: int64
  ```
  We can also create a Series directly from a dictionary mapping strings to values:
  `calories = {"day1": 420, "day2": 380, "day3": 390}; myvar = pd.Series(calories)`

* **DataFrame**: Data sets in Pandas are usually multi-dimensional tables, called `DataFrames`. A `Series` is like a column, and a `DataFrame` is the whole table. We can initialize one using a dictionary mapping strings to arrays of equal length.

* **Locating Data**: 
  * We can locate a row using the method `.loc[]` using array indices.
  * We can request multiple rows: `df.loc[[1, 2, 3, 4]]`. When passing a list of indices, the result is a new `DataFrame`.
  * `df.head()` views the top results, and `df.tail()` views the last results.

* **Data Cleaning & Exploration**:
  * `df.info()` tells us which columns contain null values and data types.
  * `df.dropna()` removes rows with empty cells. To mutate the original dataframe in place, use `df.dropna(inplace=True)`.
  * `df.fillna(120, inplace=True)` replaces all null values with 120.
  * `df.drop_duplicates(inplace=True)` removes duplicated rows.
  * `df.corr()` calculates the correlation matrix between all features.

---

## 2. Data Splitting

In Machine Learning, we generally divide our dataset into up to 3 distinct subsets to ensure our model generalizes well to unseen data.

1. **Training Set**: The subset of data the model is explicitly trained on. The model "sees" this data and updates its internal parameters (weights/biases) to minimize error.
2. **Validation Set**: The subset used to manually check whether the model is doing well during the training phase. It is used to tune hyperparameters (e.g., polynomial degree, learning rate), compare different model architectures, and make decisions without touching the test set.
3. **Testing Set**: The sacred subset. It is **not touched at all** during training or validation. It is only used at the very end to evaluate the final performance of the model, giving a true estimate of its generalization error on entirely unseen data.

*(Note: In the provided Playground files, we sometimes only use a Validation set and omit a separate Test set for the sake of simplicity.)*

---

## 3. Cross-Validation Techniques

When datasets are small, splitting a large portion off for validation/testing might leave too little data to train a good model. Cross-validation (CV) solves this by splitting the data into chunks, rotating which chunk is used for validation, and averaging the performance.

### K-Fold Cross Validation
* **How it works**: The dataset is divided randomly into $K$ equal-sized partitions (folds). The model is trained on $K-1$ folds and validated on the remaining $1$ fold. This process is repeated $K$ times, such that every fold serves as the validation set exactly once.
* **Pros**: Every data point gets to be in a test set exactly once, and gets to be in a training set $K-1$ times. The variance of the resulting estimate is reduced as $K$ increases.
* **Cons**: Purely random splits might result in an imbalanced fold.

### Leave-One-Out Cross-Validation (LOOCV)
* **How it works**: This is an extreme case of K-Fold where $K$ equals the total number of data points ($N$). For a dataset of 150 instances, we train on 149 and test on 1. We repeat this 150 times.
* **Pros**: Highly unbiased evaluation, as almost all data is used for training.
* **Cons**: Extremely computationally expensive, as the model must be trained $N$ times.

### Stratified K-Fold Cross Validation
* **The Problem with Standard K-Fold**: If you are classifying cats and dogs, and your dataset is 90% dogs and 10% cats, a standard random K-Fold might create a validation fold that contains *only* dogs, or *only* cats. This destroys the ability to accurately measure the model's performance on the true distribution of data.
* **How Stratified K-Fold works**: It enforces that **the proportion of classes in each fold is strictly identical to the proportion of classes in the entire dataset.** 
* **Example**: Consider a dataset of 100 animals (90 Dogs, 10 Cats). If $K=5$, each fold will contain exactly 20 animals. Stratified K-Fold guarantees that each of the 5 folds will contain exactly 18 Dogs (90%) and 2 Cats (10%).
* **When to use**: **Always** use Stratified K-Fold for classification tasks, especially if the dataset classes are imbalanced. 

---

## 4. Classification Evaluation Metrics

When evaluating a classifier, you cannot just look at one number. We construct a **Confusion Matrix** to break down predictions into four categories:
* **True Positives (TP)**: We predicted Positive, and it was Positive.
* **True Negatives (TN)**: We predicted Negative, and it was Negative.
* **False Positives (FP)**: We predicted Positive, but it was Negative (Type I error).
* **False Negatives (FN)**: We predicted Negative, but it was Positive (Type II error).

### Accuracy
* **Formula**: $\frac{TP + TN}{TP + TN + FP + FN}$
* **Intuition**: What percentage of total predictions did we get right?
* **Limitation**: Terrible for imbalanced datasets. If 99% of transactions are legitimate and 1% are fraud, a model that *always* predicts "legitimate" has 99% accuracy but is completely useless at catching fraud.

### Precision
* **Formula**: $\frac{TP}{TP + FP}$
* **Intuition**: Out of all the times the model *claimed* a sample was Positive, how often was it actually Positive? 
* **When to use**: When the cost of a False Positive is very high. (e.g., A spam filter. You don't want to accidentally send an important email from your boss to the spam folder).

### Recall (also known as Sensitivity or True Positive Rate)
* **Formula**: $\frac{TP}{TP + FN}$
* **Intuition**: Out of all the *actual* Positive samples in the universe, how many did our model successfully find?
* **When to use**: When the cost of a False Negative is very high. (e.g., Cancer screening. It's better to flag a healthy person for further review (FP) than to miss someone who actually has cancer (FN)).

### F1-Score
* **Formula**: $2 \times \frac{Precision \times Recall}{Precision + Recall}$
* **Intuition**: The Harmonic Mean of Precision and Recall. It punishes extreme values. A model with 1.0 Precision and 0.0 Recall will have an F1-score of 0.0. It requires both to be high to yield a high score.
* **When to use**: When you need a single metric to balance Precision and Recall, particularly on imbalanced datasets.

---

## 5. Regression Evaluation Metrics

Regression predicts continuous numbers (e.g., house prices). We evaluate it based on variance and error.

### $R^2$ (Coefficient of Determination)
* **What it means**: $R^2$ tells us how much of the variation in our target variable ($y$) can be explained by our features ($X$). 
* **Formula**: 
  $$ R^2 = \frac{\text{Variance(around mean)} - \text{Variance(line fit)}}{\text{Variance(around mean)}} = 1 - \frac{\text{Sum of Squared Errors (Model)}}{\text{Sum of Squared Errors (Mean Baseline)}} $$
* **Intuition**: If you had no model, your best guess for any data point would just be the average (mean) of all target values. $R^2$ measures how much better your line fits the data compared to that flat mean line. 
* **Interpretation**: An $R^2$ of 0.85 means that 85% of the variance in the target is explained by your model. A negative $R^2$ means your model is literally worse than just guessing the mean.

### F-Statistic (F-Value)
* **The Problem with $R^2$**: If you keep adding garbage, useless features to your model, $R^2$ will always stay the same or go up. It never goes down. We need a metric that proves the features we added are *actually* statistically significant and not just fitting noise.
* **Formula**:
  $$ F = \frac{(\text{SS}_{mean} - \text{SS}_{fit}) / (p_{fit} - p_{mean})}{\text{SS}_{fit} / (n - p_{fit})} $$
  Alternatively written as:
  $$ F = \frac{\text{Variation explained by the model / Degrees of freedom}}{\text{Variation NOT explained by the model / Degrees of freedom}} $$
* **What are $n$ and $p$?**
  * $n$: The total number of observations (rows of data).
  * $p_{fit}$: The number of parameters (features/coefficients) in your model.
  * $p_{mean}$: The number of parameters in the baseline mean model (always 1, the y-intercept).
  * $(n - p_{fit})$: The "degrees of freedom" of the residuals. It represents the variation *not* explained by the model. As you add more parameters ($p_{fit}$ increases), you lose degrees of freedom, which shrinks the denominator and makes it harder to get a high F-value unless the new parameters significantly reduce the error.
* **Intuition**: A large F-value means that the additional variables contributing to the line fit have caused a big, meaningful impact on reducing error relative to their cost.

### P-Value
* **What it means**: The probability that you would observe an F-statistic as high as yours purely by random chance, assuming the Null Hypothesis is true (i.e., assuming your features have absolutely zero real relationship to the target).
* **Why do we want it to be small?**: If $p = 0.01$, it means there is only a 1% chance that random noise could have produced a model this accurate. Because that chance is so tiny, we reject the idea that it's just random noise, and conclude our model has found a true underlying pattern.
* **Calculation via Permutation (Manual)**: To generate a p-value manually:
  1. Calculate the F-statistic for your actual, real data.
  2. Shuffle/scramble the target variable ($y$) randomly. This artificially destroys any real relationship between $X$ and $y$.
  3. Fit a new line and calculate the F-statistic on this scrambled, random data.
  4. Repeat steps 2-3 thousands of times to build a histogram (distribution) of "random" F-statistics.
  5. The **p-value** is the proportion of these random F-statistics that were equal to or greater than your actual F-statistic. 

---

## 6. Information Theory Concepts

Information theory deals with how we quantify "information."

### Self-Information (Surprise)
* **Intuition**: If someone tells you "The sun rose in the east today", you gained zero information because the probability of that happening is 100%. You are not surprised. If someone tells you "It snowed in the Sahara desert today", you gained a massive amount of information, because the probability is tiny. **Surprise is inversely related to probability.**
* **Formula**: $\text{Surprise}(x) = -\log(P(x))$
* Notice that if $P(x) = 1$, the log is 0, so surprise is 0. As $P(x)$ approaches 0, the surprise approaches infinity.

### Entropy
* **Intuition**: Entropy is the **Expected Surprise** of an entire probability distribution. It measures the average amount of unpredictability or chaos in a system. 
* **Formula**: $H(X) = \sum P(x) \times \text{Surprise}(x) = -\sum P(x)\log_2(P(x))$
* A flipped coin with a 50/50 probability has maximum entropy (1 bit) because you have zero idea what it will land on. A biased coin with a 99/1 probability has very low entropy (close to 0 bits) because it's highly predictable.

### Mutual Information (MI)
* **What it is**: Gives information about closely related two variables. It measures how much knowing about variable $Y$ reduces your uncertainty (entropy) about variable $X$.
* **Formula**: $MI = \sum \sum P(x,y) \times \log\left(\frac{P(x,y)}{P(x)P(y)}\right)$
* **Intuition**: If two variables are completely independent (like shoe size and stock market prices), their joint probability $P(x,y)$ equals $P(x)P(y)$. In this case, the fraction inside the log becomes 1, the log becomes 0, and the Mutual Information is exactly 0. If they are highly correlated, MI will be a large positive number.

---

* **Why is our goal to make $p$ small?**
  A small $p$-value indicates that the result we achieved is extremely unlikely to have happened by random chance. In science, a standard threshold is $p < 0.05$. If $p$ is small, we can confidently reject the "null hypothesis" (the assumption that our model features are useless) and accept that our model has genuinely learned something predictive.
* **How is variation not explained by B calculated?**
  It is the Sum of Squared Errors (SSE) of the model's line: $\sum (y_{actual} - y_{predicted})^2$. This is literally the leftover distance (error) between the data points and the best-fit line.
* **Why visualize the p-value computation?**
  By plotting a histogram of F-statistics generated from completely randomized data, you can visually see the distribution of "pure noise". If your actual model's F-statistic sits far to the right, totally outside the bell curve of noise, it provides immediate, visual, intuitive proof that your model's accuracy is not a fluke.