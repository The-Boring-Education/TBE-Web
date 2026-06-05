import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const newMarkdown = `# Deep Dive into Classes and Objects

Welcome to the foundational module of Object-Oriented Programming (OOP). In this chapter, we will explore the core concepts of **Classes** and **Objects**, understand how they work under the hood, and look at practical examples and implementation details similar to GeeksforGeeks and top engineering learning platforms.

---

## 1. The Blueprint and the Instance

To understand OOP, let's start with a real-world analogy. Consider a **building blueprint** designed by an architect. The blueprint itself is not a house—you cannot live inside it. It simply details the measurements, rooms, and structure. However, using this single blueprint, developers can build **multiple actual houses**.

In OOP terms:
* **Class**: The architectural blueprint. It defines the structure, variables, and capabilities.
* **Object**: The actual physical house constructed from the blueprint. It is a concrete instance that exists in memory.

<aside>
💡 **Definition:** A **Class** is a user-defined template or prototype from which objects are created. An **Object** is an instance of a class that encapsulates state (data) and behavior (code).
</aside>

### Core Properties of Class and Object

| Feature | Class | Object |
| :--- | :--- | :--- |
| **Entity Type** | Logical entity (blueprint) | Physical entity (exists in memory) |
| **Memory Allocation** | No memory is allocated when declared | Memory is allocated on instantiation (Heap) |
| **Syntax (Java/C++)** | Declared using the \`class\` keyword | Created using the \`new\` keyword |
| **Lifetime** | Exists for the entire duration of program execution | Created and destroyed dynamically during runtime |

---

## 2. Anatomy of a Class

A class generally consists of three main parts:
1. **State/Attributes**: Represented by data fields/variables (what the object *knows*).
2. **Behavior/Methods**: Represented by functions (what the object *does*).
3. **Access Modifiers**: Controls visibility and security (e.g., \`private\`, \`public\`, \`protected\`).

---

## 3. Creating and Instantiating Objects

When you declare a class variable, you only create a reference. The object is only created and allocated memory in the **Heap** when the \`new\` keyword is used.

Let's trace what happens in memory:

![Memory Layout](https://kommodo.ai/i/IrEvddp7KcinHRNZvEuX)

* **Stack Memory**: Stores the reference variable \`myCar\`.
* **Heap Memory**: Stores the actual instance data: \`model = "Tesla"\` and \`currentSpeed = 100\`.

---

## 4. Code Implementation in Multiple Languages

Here is how you define a class and instantiate objects in the major programming languages.

### Java
\`\`\`java
public class Car {
    private String brand;
    private int speed;

    // Parameterized Constructor
    public Car(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }

    public void display() {
        System.out.println(this.brand + " @ " + this.speed + " km/h");
    }

    public static void main(String[] args) {
        Car myCar = new Car("Tesla", 200);
        myCar.display();
    }
}
\`\`\`

### C++
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Car {
private:
    string brand;
    int speed;

public:
    // Parameterized Constructor
    Car(string b, int s) {
        brand = b;
        speed = s;
    }

    void display() {
        cout << brand << " @ " << speed << " km/h" << endl;
    }
};

int main() {
    Car myCar("Tesla", 200);
    myCar.display();
    return 0;
}
\`\`\`

### Python
\`\`\`python
class Car:
    def __init__(self, brand: str, speed: int):
        self.brand = brand
        self.speed = speed

    def display(self):
        print(f"{self.brand} @ {self.speed} km/h")

if __name__ == "__main__":
    my_car = Car("Tesla", 200)
    my_car.display()
\`\`\`

### JavaScript
\`\`\`javascript
class Car {
    constructor(brand, speed) {
        this.brand = brand;
        this.speed = speed;
    }

    display() {
        console.log(\`\${this.brand} @ \${this.speed} km/h\`);
    }
}

const myCar = new Car("Tesla", 200);
myCar.display();
\`\`\`

---

## 5. Frequently Asked Questions

#### Q1. Can a class have multiple constructors?
Yes, this is known as **Constructor Overloading**. You can write multiple constructors with different parameter signatures.

#### Q2. What is the difference between a reference variable and an object?
A reference variable is a pointer or address holder (stored on the Stack). An object is the actual instance containing data (stored on the Heap).

#### Q3. Can we declare static variables inside a class?
Yes. A \`static\` variable is shared among all instances of a class. It is allocated memory only once in the class area/method area when the class is loaded.
`;

async function update() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const result = await db.collection("coresubjects").updateOne(
    { subjectId: "oops", "chapters.title": "Classes & Objects" },
    {
      $set: {
        "chapters.$.content": {
          overview: "",
          notes: [],
          importantPoints: [],
          interviewQuestions: [],
          codeBlock: "",
          markdownContent: newMarkdown,
        },
      },
    },
  );

  console.log("Update result:", result);
  await client.close();
}

update();
