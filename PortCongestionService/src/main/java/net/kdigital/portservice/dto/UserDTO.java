package net.kdigital.portservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.kdigital.portservice.entity.UserEntity;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
	private String userEmail;
	private String userPwd;
	private String userName;
	private String userPhone;
	private String company;
	private LocalDateTime joinDate;
	private String userRole;
	private boolean notificationSetting;
	private boolean enabled;
	
	public static UserDTO toDTO(UserEntity userEntity) {
		return UserDTO.builder()
				.userEmail(userEntity.getUserEmail())
				.userPwd(userEntity.getUserPwd())
				.userName(userEntity.getUserName())
				.userPhone(userEntity.getUserPhone())
				.company(userEntity.getCompany())
				.joinDate(userEntity.getJoinDate())
				.userRole(userEntity.getUserRole())
				.notificationSetting(userEntity.isNotificationSetting())
				.enabled(userEntity.isEnabled())
				.build();

	}

	
}
