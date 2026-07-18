/*
 * 실습 순서 02 — 사용자 저장 계약
 * 선행 단계: Step01에서 정한 email/password 입력 범위를 확인합니다.
 * 이 단계의 판단: DTO를 통과한 값이 DB에서 잘리지 않도록 길이와 null/unique 제약을 맞춥니다.
 * 다음 연결: Step06 회원가입이 정규화한 email과 BCrypt hash를 이 Entity로 저장합니다.
 */
package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class User(
    // IDENTITY 전략은 식별자 생성을 DB에 맡기므로 새 객체의 0L은 저장 뒤 DB가 만든 id로 바뀝니다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // 실습 빈칸 대응: email 컬럼은 DTO의 최대 길이와 unique 저장 계약을 함께 지킵니다.
    // 설명 포인트: 요청을 통과한 값이 DB에서 잘리지 않아야 계층 간 계약이 일치합니다.
    // 확인 질문: 중복 사전 조회가 있어도 unique 제약을 유지해야 하는 이유는 무엇일까요?
    @Column(nullable = false, unique = true, length = 254)
    var email: String,

    // 실습 빈칸 대응: password 컬럼은 BCrypt 결과를 온전히 저장할 수 있어야 합니다.
    // 설명 포인트: 원문 입력 길이와 암호화된 저장 문자열 길이는 서로 다른 계약입니다.
    // 확인 질문: 해시가 일부 잘리면 올바른 password도 왜 인증에 실패할까요?
    @Column(nullable = false, length = 100)
    var password: String
)
