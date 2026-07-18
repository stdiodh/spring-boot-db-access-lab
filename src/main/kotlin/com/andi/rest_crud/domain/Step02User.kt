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

    // TODO(Validation) DTO와 같은 email 최대 길이를 지정하고 unique 제약은 유지하세요.
    @Column(nullable = false, unique = true)
    var email: String,

    // TODO(Validation) BCrypt hash가 잘리지 않는 password 컬럼 길이를 지정하세요.
    @Column(nullable = false)
    var password: String
)
