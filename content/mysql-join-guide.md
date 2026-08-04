---
title: (MY)SQL JOIN 가이드 for Beginner
summary: 레거시 서비스를 유지보수하며 SQL을 직접 쓰다 정리한 JOIN 노트. 네 가지 종류가 무엇을 남기고 무엇을 버리는지, 실행 가능한 예제와 함께.
publishedAt: 2024-08-16
---

레거시 서비스를 유지보수하면서 모델에서 SQL을 직접 작성할 일이 많았습니다. 그때 정리해 둔 JOIN 노트입니다.

JOIN은 관계형 데이터베이스에서 여러 테이블의 데이터를 결합하는 기능입니다. 정규화로 나눠 둔 테이블을 다시 하나의 결과로 합치는 일이라, 데이터를 중복 없이 저장하면서도 필요할 때 온전한 형태로 꺼내 쓸 수 있게 해줍니다. 테이블 간 관계는 1:1, 1:N, N:M으로 구분됩니다.

## 네 가지 JOIN

![테이블 A와 B의 벤 다이어그램으로 나타낸 INNER, LEFT, RIGHT, FULL OUTER JOIN의 결과 범위](/images/mysql-join-guide/diagram.png)

| 종류 | 남는 것 | 빈 자리 |
| --- | --- | --- |
| INNER | 양쪽 모두 일치하는 행만 | — |
| LEFT (OUTER) | 왼쪽 전부 + 일치하는 오른쪽 | 오른쪽이 NULL |
| RIGHT (OUTER) | 오른쪽 전부 + 일치하는 왼쪽 | 왼쪽이 NULL |
| FULL (OUTER) | 양쪽 전부 | 없는 쪽이 NULL |

INNER는 교집합이라고 생각하면 쉽습니다. OUTER 계열은 한쪽을 기준으로 삼고, 짝이 없으면 NULL로 채웁니다. **MySQL은 FULL OUTER JOIN을 직접 지원하지 않으므로** LEFT와 RIGHT를 `UNION`으로 합쳐 흉내 내야 합니다.

## 실습용 테이블

설명만으로는 감이 안 오니 가상의 쇼핑몰 스키마를 만들어 두고 이야기하겠습니다. 고객, 상품, 주문, 주문 상세 네 개입니다. [SQL Fiddle](https://sqlfiddle.com/mysql/online-compiler)의 *INIT database*에 아래를 붙여 넣으면 아래 쿼리들을 그대로 실행해 볼 수 있습니다.

```sql
CREATE TABLE Customers (
    c_id INT PRIMARY KEY,
    c_name VARCHAR(100) NOT NULL,
    c_email VARCHAR(100) UNIQUE NOT NULL,
    c_phone VARCHAR(20),
    address VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Products (
    p_id INT PRIMARY KEY,
    p_name VARCHAR(100) NOT NULL,
    p_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock_quantity INT NOT NULL DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Orders (
    o_id INT PRIMARY KEY,
    o_date DATE NOT NULL,
    o_total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    c_id INT NOT NULL,
    shipping_address VARCHAR(200),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE OrderDetails (
    o_d_id INT PRIMARY KEY,
    o_id INT NOT NULL,
    p_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount DECIMAL(10, 2) DEFAULT 0.00
);

INSERT INTO Customers (c_id, c_name, c_email, c_phone, address) VALUES
    (1, 'Noah', 'noah@gmail.com', '111-222-3333', '123 Apple St, New York, NY 10001'),
    (2, 'Kyle', 'kyle@gmail.com', '444-555-6666', '456 Banana Ave, Los Angeles, CA 90001'),
    (3, 'Chuck', 'chuck@gmail.com', '777-888-9999', '789 Cherry Ln, Chicago, IL 60601');

INSERT INTO Products (p_id, p_name, p_price, description, stock_quantity, category) VALUES
    (1, 'iPhone', 10000.00, 'Latest model iPhone with advanced features', 100, 'Electronics'),
    (2, 'iPad', 20000.00, 'Powerful and versatile iPad for work and play', 50, 'Electronics'),
    (3, 'AirPod', 30000.00, 'Wireless earbuds with exceptional sound quality', 200, 'Accessories');

INSERT INTO Orders (o_id, o_date, o_total_amount, status, c_id, shipping_address, payment_method) VALUES
    (1, '2024-08-14', 100000.00, 'Pending', 1, '123 Apple St, New York, NY 10001', 'Credit Card'),
    (2, '2024-08-15', 300000.00, 'Delivered', 2, '456 Banana Ave, Los Angeles, CA 90001', 'PayPal'),
    (3, '2024-08-16', 60000.00, 'Processing', 2, '456 Banana Ave, Los Angeles, CA 90001', 'Debit Card');

INSERT INTO OrderDetails (o_d_id, o_id, p_id, quantity, unit_price, discount) VALUES
    (1, 1, 1, 10, 10000.00, 0.00),
    (2, 2, 1, 10, 10000.00, 0.00),
    (3, 2, 2, 10, 20000.00, 0.00),
    (4, 3, 3, 5, 30000.00, 5000.00);
```

고객 `Chuck`은 주문이 하나도 없습니다. 뒤에서 INNER와 LEFT의 차이를 만드는 게 이 사람입니다.

## INNER JOIN — 네 테이블을 꿰어 하나의 명세로

주문 상세를 사람이 읽을 수 있는 형태로 보려면 네 테이블이 모두 필요합니다. 누가(Customers) 언제(Orders) 무엇을(Products) 몇 개(OrderDetails) 샀는지가 각각 흩어져 있기 때문입니다.

```sql
SELECT
    c.c_name AS customer_name,
    o.o_id AS order_id,
    o.o_date AS order_date,
    p.p_name AS product_name,
    od.quantity,
    od.unit_price,
    od.subtotal,
    (od.subtotal - od.discount) AS final_price
FROM
    Customers c
INNER JOIN Orders o ON c.c_id = o.c_id
INNER JOIN OrderDetails od ON o.o_id = od.o_id
INNER JOIN Products p ON od.p_id = p.p_id
WHERE
    o.o_date BETWEEN '2024-08-01' AND '2024-08-31'
    AND p.category = 'Electronics'
ORDER BY
    o.o_date DESC, od.subtotal DESC;
```

2024년 8월에 발생한 `Electronics` 카테고리 주문만 걸러 주문일과 소계 내림차순으로 정렬합니다. `final_price`는 소계에서 할인을 뺀 값입니다.

INNER이므로 네 테이블 어디에서든 짝을 찾지 못하면 그 행은 사라집니다. 주문이 없는 `Chuck`은 결과에 나타나지 않습니다.

## LEFT JOIN — 아무것도 안 산 고객까지 세기

반대로 "전체 고객의 구매 통계"를 뽑는다면 주문이 없는 고객도 0으로 잡혀야 합니다. 기준 테이블을 왼쪽에 두고 LEFT JOIN을 씁니다.

```sql
SELECT
    c.c_name AS customer_name,
    COALESCE(COUNT(DISTINCT o.o_id), 0) AS total_orders,
    COALESCE(SUM(od.quantity), 0) AS total_items_purchased,
    COALESCE(SUM(od.subtotal - od.discount), 0) AS total_spent,
    MAX(o.o_date) AS last_order_date,
    GROUP_CONCAT(DISTINCT p.category SEPARATOR ', ') AS purchased_categories
FROM
    Customers c
LEFT JOIN Orders o ON c.c_id = o.c_id
LEFT JOIN OrderDetails od ON o.o_id = od.o_id
LEFT JOIN Products p ON od.p_id = p.p_id
GROUP BY
    c.c_id, c.c_name
ORDER BY
    total_spent DESC, total_orders DESC;
```

같은 네 테이블인데 JOIN 종류만 바꿨더니 `Chuck`이 결과에 들어옵니다. 다만 짝이 없는 쪽은 전부 NULL이라, `COALESCE`로 0을 채워주지 않으면 합계 칸이 비어 버립니다. `GROUP_CONCAT`은 고객이 산 카테고리들을 쉼표로 이어 한 칸에 넣습니다.

## 쓰면서 걸렸던 것들

**JOIN 조건을 빠뜨리면 조용히 곱해집니다.** `ON`을 잘못 쓰면 에러가 아니라 행 수가 폭증합니다. 복잡한 쿼리는 JOIN을 하나씩 붙여가며 중간 결과의 행 수를 확인하는 편이 안전합니다.

**JOIN 컬럼에는 인덱스가 있어야 합니다.** 없으면 테이블이 커질수록 급격히 느려집니다. 그리고 꼭 필요한 테이블만 붙이는 게 가장 확실한 최적화입니다.

**OUTER JOIN을 썼다면 NULL을 반드시 처리해야 합니다.** `COALESCE`나 `IFNULL`로 기본값을 채우고, 비교할 때는 `= NULL`이 아니라 `IS NULL` / `IS NOT NULL`을 씁니다.

**복잡해지면 CTE로 쪼갭니다.** 서브쿼리를 중첩하는 대신 `WITH`로 이름을 붙여 단계를 나누면 읽기도 고치기도 쉬워집니다.

여기까지가 간단한 JOIN을 유지보수하는 데 필요한 최소한입니다. `SELF JOIN`이나 `CROSS JOIN` 같은 것들은 필요해질 때 찾아 쓰면 되고, 그보다 실행 계획을 한 번 열어보는 습관이 훨씬 도움이 됐습니다.
